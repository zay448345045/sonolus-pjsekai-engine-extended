import { archetypes } from '~/engine/playData/archetypes/index.mjs'
import { windows } from '~/engine/playData/archetypes/windows.mjs'
import { buckets } from '~/engine/playData/buckets.mjs'
import { effect } from '~/engine/playData/effect.mjs'
import { particle } from '~/engine/playData/particle.mjs'
import { skin } from '~/engine/playData/skin.mjs'
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
