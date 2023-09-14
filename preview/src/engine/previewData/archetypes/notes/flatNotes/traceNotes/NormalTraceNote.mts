import { skin } from '../../../../skin.mjs'
import { TraceNote } from './TraceNote.mjs'

export class NormalTraceNote extends TraceNote {
    sprites = {
        left: skin.sprites.normalTraceNoteLeft,
        middle: skin.sprites.normalTraceNoteMiddle,
        right: skin.sprites.normalTraceNoteRight,
        fallback: {
            left: skin.sprites.normalTraceNoteFallbackLeft,
            middle: skin.sprites.normalTraceNoteFallbackMiddle,
            right: skin.sprites.normalTraceNoteFallbackRight,
        },
        secondaryFallback: skin.sprites.normalTraceNoteSecondaryFallback,
    }

    tickSprites = {
        tick: skin.sprites.normalTraceNoteTickNote,
        fallback: skin.sprites.normalTraceNoteTickNoteFallback,
    }
}
