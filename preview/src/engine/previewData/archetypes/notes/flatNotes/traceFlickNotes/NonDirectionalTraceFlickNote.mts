import { skin } from '../../../../skin.mjs'
import { SlimNote } from '../SlimNote.mjs'

export class NonDirectionalTraceFlickNote extends SlimNote {
    sprites = {
        left: skin.sprites.traceFlickNoteLeft,
        middle: skin.sprites.traceFlickNoteMiddle,
        right: skin.sprites.traceFlickNoteRight,
        fallback: {
            left: skin.sprites.flickNoteLeft,
            middle: skin.sprites.flickNoteMiddle,
            right: skin.sprites.flickNoteRight,
        },
        secondaryFallback: skin.sprites.flickNoteFallback,
    }
}
