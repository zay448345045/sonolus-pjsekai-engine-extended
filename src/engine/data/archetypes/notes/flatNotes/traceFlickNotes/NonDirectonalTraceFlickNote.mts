import { buckets } from '~/engine/data/buckets.mjs'
import { effect } from '~/engine/data/effect.mjs'
import { particle } from '~/engine/data/particle.mjs'
import { skin } from '../../../../skin.mjs'
import { archetypes } from '../../../index.mjs'
import { windows } from '../../../windows.mjs'
import { TraceFlickNote } from './TraceFlickNote.mjs'

export class NonDirectionalTraceFlickNote extends TraceFlickNote {
    sprites = {
        left: skin.sprites.traceFlickNoteLeft,
        middle: skin.sprites.traceFlickNoteMiddle,
        right: skin.sprites.traceFlickNoteRight,
        primaryFallback: {
            left: skin.sprites.flickNoteLeft,
            middle: skin.sprites.flickNoteMiddle,
            right: skin.sprites.flickNoteRight,
        },
        secondaryFallback: skin.sprites.flickNoteFallback,
    }

    clips = {
        perfect: effect.clips.flickPerfect,
        great: effect.clips.flickGreat,
        good: effect.clips.flickGood,
    }

    effects = {
        circular: particle.effects.flickNoteCircular,
        linear: particle.effects.flickNoteLinear,
    }

    windows = windows.flickNote.normal

    bucket = buckets.normalFlickNote

    get slotEffect() {
        return archetypes.FlickSlotEffect
    }

    get slotGlowEffect() {
        return archetypes.FlickSlotGlowEffect
    }
}
