import { effect } from '~/engine/playData/effect.mjs'
import { particle } from '~/engine/playData/particle.mjs'
import { skin } from '~/engine/playData/skin.mjs'
import { TraceSlideStartNote } from './TraceSlideStartNote.mjs'

export class CriticalTraceSlideStartNote extends TraceSlideStartNote {
    sprites = {
        left: skin.sprites.criticalTraceNoteLeft,
        middle: skin.sprites.criticalTraceNoteMiddle,
        right: skin.sprites.criticalTraceNoteRight,
        primaryFallback: {
            left: skin.sprites.criticalNoteLeft,
            middle: skin.sprites.criticalNoteMiddle,
            right: skin.sprites.criticalNoteRight,
        },
        secondaryFallback: skin.sprites.criticalNoteFallback,
    }

    tickSprites = {
        tick: skin.sprites.criticalSlideTickNote,
        fallback: skin.sprites.criticalSlideTickNoteFallback,
    }

    clips = {
        perfect: effect.clips.criticalTrace,
        fallback: effect.clips.normalPerfect,
    }

    effects = {
        circular: particle.effects.criticalNoteCircular,
        linear: particle.effects.criticalNoteLinear,
    }
}
