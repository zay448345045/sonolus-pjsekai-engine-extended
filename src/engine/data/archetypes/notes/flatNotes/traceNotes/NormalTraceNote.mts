import { archetypes } from '~/engine/data/archetypes/index.mjs'
import { windows } from '~/engine/data/archetypes/windows.mjs'
import { buckets } from '~/engine/data/buckets.mjs'
import { effect } from '~/engine/data/effect.mjs'
import { particle } from '~/engine/data/particle.mjs'
import { skin } from '~/engine/data/skin.mjs'
import { TraceNote } from './TraceNote.mjs'

export class NormalTraceNote extends TraceNote {
    sprites = {
        left: skin.sprites.normalTraceNoteLeft,
        middle: skin.sprites.normalTraceNoteMiddle,
        right: skin.sprites.normalTraceNoteRight,
        primaryFallback: {
            left: skin.sprites.normalTraceNoteFallbackLeft,
            middle: skin.sprites.normalTraceNoteFallbackMiddle,
            right: skin.sprites.normalTraceNoteFallbackRight,
        },
        secondaryFallback: skin.sprites.normalTraceNoteSecondaryFallback,
    }

    tickSprites = {
        tick: skin.sprites.normalTraceNoteTickNote,
        fallback: skin.sprites.normalTraceNoteTickNote,
    }

    clips = {
        perfect: effect.clips.normalTrace,
        fallback: effect.clips.normalPerfect,
    }

    effects = {
        circular: particle.effects.normalTraceNoteCircular,
        linear: particle.effects.normalTraceNoteLinear,
    }

    windows = windows.tapNote.normal

    bucket = buckets.normalTraceNote

    get slotEffect() {
        return archetypes.NormalTraceSlotEffect
    }

    get slotGlowEffect() {
        return archetypes.NormalTraceSlotGlowEffect
    }
}
