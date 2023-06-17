import { buckets } from '../../../../buckets.mjs'
import { effect } from '../../../../effect.mjs'
import { particle } from '../../../../particle.mjs'
import { skin } from '../../../../skin.mjs'
import { archetypes } from '../../../index.mjs'
import { windows } from '../../../windows.mjs'
import { TraceNote } from './TraceNote.mjs'

export class CriticalTraceNote extends TraceNote {
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

    clips = {
        perfect: effect.clips.criticalTap,
        fallback: effect.clips.normalPerfect,
    }

    effects = {
        circular: particle.effects.criticalNoteCircular,
        linear: particle.effects.criticalNoteLinear,
    }

    windows = windows.tapNote.critical

    bucket = buckets.criticalTapNote

    get slotEffect() {
        return archetypes.CriticalSlotEffect
    }

    get slotGlowEffect() {
        return archetypes.CriticalSlotGlowEffect
    }
}
