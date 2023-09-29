import { SkinSpriteName } from 'sonolus-core'
import { panel } from './panel.mjs'

export const skin = defineSkin({
    sprites: {
        lane: SkinSpriteName.Lane,
        stageLeftBorder: SkinSpriteName.StageLeftBorder,
        stageRightBorder: SkinSpriteName.StageRightBorder,

        simLine: SkinSpriteName.SimultaneousConnectionNeutral,

        normalNoteLeft: 'Sekai Note Cyan Left',
        normalNoteMiddle: 'Sekai Note Cyan Middle',
        normalNoteRight: 'Sekai Note Cyan Right',
        normalNoteFallback: SkinSpriteName.NoteHeadCyan,

        slideNoteLeft: 'Sekai Note Green Left',
        slideNoteMiddle: 'Sekai Note Green Middle',
        slideNoteRight: 'Sekai Note Green Right',
        slideNoteFallback: SkinSpriteName.NoteHeadGreen,
        slideNoteEndFallback: SkinSpriteName.NoteTailGreen,

        flickNoteLeft: 'Sekai Note Red Left',
        flickNoteMiddle: 'Sekai Note Red Middle',
        flickNoteRight: 'Sekai Note Red Right',
        flickNoteFallback: SkinSpriteName.NoteHeadRed,
        flickNoteEndFallback: SkinSpriteName.NoteTailRed,

        criticalNoteLeft: 'Sekai Note Yellow Left',
        criticalNoteMiddle: 'Sekai Note Yellow Middle',
        criticalNoteRight: 'Sekai Note Yellow Right',
        criticalNoteFallback: SkinSpriteName.NoteHeadYellow,
        criticalNoteEndFallback: SkinSpriteName.NoteTailYellow,

        normalSlideTickNote: 'Sekai Diamond Green',
        normalSlideTickNoteFallback: SkinSpriteName.NoteTickGreen,

        criticalSlideTickNote: 'Sekai Diamond Yellow',
        criticalSlideTickNoteFallback: SkinSpriteName.NoteTickYellow,

        normalSlideConnectorNormal: 'Sekai Slide Connection',
        normalSlideConnectorFallback: SkinSpriteName.NoteConnectionGreenSeamless,

        criticalSlideConnectorNormal: 'Sekai Critical Slide Connection',
        criticalSlideConnectorFallback: SkinSpriteName.NoteConnectionYellowSeamless,

        flickArrowUp1: 'Sekai Flick Arrow Up 1',
        flickArrowUp2: 'Sekai Flick Arrow Up 2',
        flickArrowUp3: 'Sekai Flick Arrow Up 3',
        flickArrowUp4: 'Sekai Flick Arrow Up 4',
        flickArrowUp5: 'Sekai Flick Arrow Up 5',
        flickArrowUp6: 'Sekai Flick Arrow Up 6',
        flickArrowLeft1: 'Sekai Flick Arrow Left 1',
        flickArrowLeft2: 'Sekai Flick Arrow Left 2',
        flickArrowLeft3: 'Sekai Flick Arrow Left 3',
        flickArrowLeft4: 'Sekai Flick Arrow Left 4',
        flickArrowLeft5: 'Sekai Flick Arrow Left 5',
        flickArrowLeft6: 'Sekai Flick Arrow Left 6',
        flickArrowFallback: SkinSpriteName.DirectionalMarkerRed,

        criticalArrowUp1: 'Sekai Critical Flick Arrow Up 1',
        criticalArrowUp2: 'Sekai Critical Flick Arrow Up 2',
        criticalArrowUp3: 'Sekai Critical Flick Arrow Up 3',
        criticalArrowUp4: 'Sekai Critical Flick Arrow Up 4',
        criticalArrowUp5: 'Sekai Critical Flick Arrow Up 5',
        criticalArrowUp6: 'Sekai Critical Flick Arrow Up 6',
        criticalArrowLeft1: 'Sekai Critical Flick Arrow Left 1',
        criticalArrowLeft2: 'Sekai Critical Flick Arrow Left 2',
        criticalArrowLeft3: 'Sekai Critical Flick Arrow Left 3',
        criticalArrowLeft4: 'Sekai Critical Flick Arrow Left 4',
        criticalArrowLeft5: 'Sekai Critical Flick Arrow Left 5',
        criticalArrowLeft6: 'Sekai Critical Flick Arrow Left 6',
        criticalArrowFallback: SkinSpriteName.DirectionalMarkerYellow,

        beatLine: SkinSpriteName.GridNeutral,
        bpmChangeLine: SkinSpriteName.GridPurple,
        timeScaleChangeLine: SkinSpriteName.GridYellow,

        // Extended

        normalTraceNoteLeft: 'Sekai+ Slim Note Green Left',
        normalTraceNoteMiddle: 'Sekai+ Slim Note Green Middle',
        normalTraceNoteRight: 'Sekai+ Slim Note Green Right',
        normalTraceNoteSecondaryFallback: SkinSpriteName.NoteHeadGreen,

        criticalTraceNoteLeft: 'Sekai+ Slim Note Yellow Left',
        criticalTraceNoteMiddle: 'Sekai+ Slim Note Yellow Middle',
        criticalTraceNoteRight: 'Sekai+ Slim Note Yellow Right',
        criticalTraceNoteFallback: SkinSpriteName.NoteHeadYellow,

        traceFlickNoteLeft: 'Sekai+ Slim Note Red Left',
        traceFlickNoteMiddle: 'Sekai+ Slim Note Red Middle',
        traceFlickNoteRight: 'Sekai+ Slim Note Red Right',
        traceFlickTickNote: 'Sekai Diamond Red',
        traceFlickTickNoteFallback: SkinSpriteName.NoteTickRed,

        damageNoteLeft: 'Sekai+ Slim Note Purple Left',
        damageNoteMiddle: 'Sekai+ Slim Note Purple Middle',
        damageNoteRight: 'Sekai+ Slim Note Purple Right',
        damageNoteFallbackLeft: 'Sekai Note Purple Left',
        damageNoteFallbackMiddle: 'Sekai Note Purple Middle',
        damageNoteFallbackRight: 'Sekai Note Purple Right',
        damageNoteSecondaryFallback: SkinSpriteName.NoteHeadPurple,

        backgroundDim: 'Sekai+ Black Background',
    },
})

export const layer = {
    note: {
        arrow: 101,
        body: 100,
        connector: 99,
    },

    simLine: 90,

    line: 10,

    stage: 0,
}

export const line = (sprite: SkinSprite, beat: number, a: number) => {
    const pos = panel.getPos(bpmChanges.at(beat).time)

    sprite.draw(
        new Rect({
            l: -6,
            r: 6,
            b: -panel.h * 0.0025,
            t: panel.h * 0.0025,
        }).add(pos),
        layer.line,
        a
    )
}

export const getZ = (layer: number, time: number, lane: number) =>
    layer - time / 1000 - lane / 100000
