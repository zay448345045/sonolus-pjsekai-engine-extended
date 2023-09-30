import { effect } from '~/engine/playData/effect.mjs'
import { particle } from '~/engine/playData/particle.mjs'
import { skin } from '~/engine/playData/skin.mjs'
import { TraceSlideStartNote } from './TraceSlideStartNote.mjs'

export class NormalTraceSlideStartNote extends TraceSlideStartNote {
    sprites = {
        left: skin.sprites.normalTraceNoteLeft,
        middle: skin.sprites.normalTraceNoteMiddle,
        right: skin.sprites.normalTraceNoteRight,
        primaryFallback: {
            left: skin.sprites.slideNoteLeft,
            middle: skin.sprites.slideNoteMiddle,
            right: skin.sprites.slideNoteRight,
        },
        secondaryFallback: skin.sprites.slideNoteFallback,
    }

    tickSprites = {
        tick: skin.sprites.normalSlideTickNote,
        fallback: skin.sprites.normalSlideTickNoteFallback,
    }

    clips = {
        perfect: effect.clips.normalTrace,
        fallback: effect.clips.normalPerfect,
    }

    effects = {
        circular: particle.effects.slideNoteCircular,
        linear: particle.effects.slideNoteLinear,
    }
}
