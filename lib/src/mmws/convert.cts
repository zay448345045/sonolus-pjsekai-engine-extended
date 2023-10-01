import {
    USC,
    USCConnectionAttachNote,
    USCConnectionEndNote,
    USCConnectionStartNote,
    USCConnectionTickNote,
    USCSingleNote,
    USCSlideNote,
} from '../index.cjs'
import { analyze } from './analyze.cjs'

const mmwsEaseToUSCEase = {
    linear: 'linear',
    easeOut: 'out',
    easeIn: 'in',
} as const
const ticksPerBeat = 480
const laneToUSCLane = ({ lane, width }: { lane: number; width: number }): number => {
    return lane - 6 + width / 2
}

export const mmwsToUSC = (mmws: Buffer): USC => {
    const score = analyze(mmws)
    const usc: USC = {
        objects: [],
        offset: score.metadata.musicOffset / -1000,
    }

    for (const bpmChange of score.events.bpmChanges) {
        usc.objects.push({
            type: 'bpm',
            beat: bpmChange.tick / ticksPerBeat,
            bpm: bpmChange.bpm,
        })
    }
    usc.objects.push({
        type: 'timeScaleGroup',
        changes: score.events.hispeedChanges.map((hispeedChange) => ({
            beat: hispeedChange.tick / ticksPerBeat,
            timeScale: hispeedChange.speed,
        })),
    })

    for (const tap of score.taps) {
        const uscTap: USCSingleNote = {
            type: 'single',
            beat: tap.tick / ticksPerBeat,
            timeScaleGroup: 0,
            critical: tap.critical,
            lane: laneToUSCLane(tap),
            size: tap.width / 2,
            trace: false,
        }
        if (tap.flickType !== 'none') {
            uscTap.direction = tap.flickType
        }
        usc.objects.push(uscTap)
    }
    for (const hold of score.holds) {
        const uscStartNote: USCConnectionStartNote = {
            type: 'start',
            beat: hold.start.tick / ticksPerBeat,
            timeScaleGroup: 0,
            critical: hold.critical,
            ease: mmwsEaseToUSCEase[hold.start.ease],
            lane: laneToUSCLane(hold.start),
            size: hold.start.width / 2,
            judgeType: 'normal',
        }
        const uscEndNote: USCConnectionEndNote = {
            type: 'end',
            beat: hold.end.tick / ticksPerBeat,
            timeScaleGroup: 0,
            critical: hold.end.critical || hold.critical,
            lane: laneToUSCLane(hold.end),
            size: hold.end.width / 2,
            judgeType: 'normal',
        }
        if (hold.end.flickType !== 'none') {
            uscEndNote.direction = hold.end.flickType
        }

        const uscSlide: USCSlideNote = {
            type: 'slide',
            subType: 'normal',
            critical: hold.critical,
            connections: [
                uscStartNote,
                ...hold.steps.map((step) => {
                    const beat = step.tick / ticksPerBeat
                    const lane = laneToUSCLane(step)
                    const size = step.width / 2
                    if (step.type === 'ignored') {
                        return {
                            type: 'attach',
                            beat,
                            critical: hold.critical,
                            timeScaleGroup: 0,
                        } satisfies USCConnectionAttachNote
                    } else {
                        const uscStep: USCConnectionTickNote = {
                            type: 'tick',
                            beat,

                            timeScaleGroup: 0,
                            lane,
                            size,
                            ease: mmwsEaseToUSCEase[step.ease],
                        }
                        if (step.type === 'visible') {
                            uscStep.critical = hold.critical
                        }

                        return uscStep
                    }
                }),
                uscEndNote,
            ],
        }
        usc.objects.push(uscSlide)
    }

    return usc
}
