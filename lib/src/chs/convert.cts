import { gunzipSync } from 'zlib'
import { Score } from '../sus/analyze.cjs'
import { chsLikeToUSC } from '../sus/convert.cjs'
import { USC } from '../usc/index.cjs'
import { Chs2, Chs3, SusExportPluginOption } from './typing/index.cjs'

const tapLikeNotes = ['taps', 'exTaps', 'flicks', 'damages'] as const
const noteTypeToSusType = {
    taps: 1,
    exTaps: 2,
    flicks: 3,
    damages: 4,
} as const
const chsDirectionToSusDirection = (note: {
    verticalDirection: 0 | 1
    horizontalDirection: 0 | 1 | 2
}) => {
    return {
        '0:0': 1,
        '0:1': 3,
        '0:2': 4,
        '1:0': 2,
        '1:1': 5,
        '1:2': 6,
    }[`${note.verticalDirection}:${note.horizontalDirection}`]
}
const analyze = (chs: Buffer): Score => {
    const parsedChs: Chs2 | Chs3 = JSON.parse(gunzipSync(chs).toString('utf-8'))
    const bpmChanges: Score['bpmChanges'] = []
    const directionalNotes: Score['directionalNotes'] = []
    let offset: number
    const meta: Score['meta'] = new Map()
    const slides: Score['slides'] = []
    const tapNotes: Score['tapNotes'] = []
    const ticksPerBeat = parsedChs.score.ticksPerBeat
    const timeScaleChanges: Score['timeScaleChanges'] = [[]]

    meta.set('REQUEST', ['"side_lane true"'])

    if (parsedChs.version.Major === 2) {
        offset = (parsedChs as Chs2).exporterArgs.sus?.soundOffset ?? 0
    } else if (parsedChs.version.Major === 3) {
        const pluginOption = (parsedChs as Chs3).exportArgs['Ched.Plugins.SusExportPlugin']
        if (!pluginOption) {
            offset = 0
        } else {
            offset = (JSON.parse(pluginOption) as SusExportPluginOption).soundOffset ?? 0
        }
    } else {
        throw new Error('Invalid version')
    }

    for (const bpmChange of parsedChs.score.events.bpmChangeEvents) {
        bpmChanges.push({
            tick: bpmChange.tick,
            bpm: bpmChange.bpm,
        })
    }
    bpmChanges.sort((a, b) => a.tick - b.tick)
    for (const hispeedChange of parsedChs.score.events.highSpeedChangeEvents) {
        timeScaleChanges[0].push({
            tick: hispeedChange.tick,
            timeScale: hispeedChange.speedRatio,
        })
    }
    timeScaleChanges[0].sort((a, b) => a.tick - b.tick)

    for (const [noteType, note] of tapLikeNotes.flatMap((key) =>
        parsedChs.score.notes[key].map((note) => [key, note] as const)
    )) {
        const susType = noteTypeToSusType[noteType]
        tapNotes.push({
            type: susType,
            tick: note.tick,
            lane: note.laneIndex,
            width: note.width,
            timeScaleGroup: 0,
        })
    }

    const notes = Object.values(parsedChs.score.notes).flatMap((notes) =>
        typeof notes === 'string' ? [] : notes
    ) as {
        $id: string
        tick: number
        laneIndex: number
        width: number
    }[]

    for (const slide of parsedChs.score.notes.slides) {
        const susSlide: Score['slides'][0] = [
            {
                lane: slide.startLaneIndex,
                tick: slide.startTick,
                type: 1,
                width: slide.startWidth,
                timeScaleGroup: 0,
            },
        ]
        slide.stepNotes.sort((a, b) => a.tickOffset - b.tickOffset)
        for (const step of slide.stepNotes) {
            susSlide.push({
                lane: slide.startLaneIndex + step.laneIndexOffset,
                tick: slide.startTick + step.tickOffset,
                type: step.isVisible ? 3 : 5,
                width: slide.startWidth + step.widthChange,
                timeScaleGroup: 0,
            })
            notes.push({
                $id: step.$id,
                tick: slide.startTick + step.tickOffset,
                laneIndex: slide.startLaneIndex + step.laneIndexOffset,
                width: slide.startWidth + step.widthChange,
            })
        }
        susSlide[susSlide.length - 1].type = 2
        slides.push(susSlide)
    }

    for (const note of parsedChs.score.notes.airs) {
        const refNote = notes.find((n) => n.$id === note.parentNote.$ref)
        if (!refNote) {
            continue
        }
        directionalNotes.push({
            tick: refNote.tick,
            lane: refNote.laneIndex,
            width: refNote.width,
            type: chsDirectionToSusDirection(note),
            timeScaleGroup: 0,
        })
    }

    return {
        bpmChanges,
        directionalNotes,
        offset,
        meta,
        slides,
        tapNotes,
        ticksPerBeat,
        timeScaleChanges,
    }
}

export const chsToUSC = (chs: Buffer): USC => chsLikeToUSC(analyze(chs))
