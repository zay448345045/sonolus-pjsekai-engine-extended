import { skin } from '../../../../skin.mjs'
import { SlimNote } from '../SlimNote.mjs'

export class DamageNote extends SlimNote {
    sprites = {
        left: skin.sprites.damageNoteLeft,
        middle: skin.sprites.damageNoteMiddle,
        right: skin.sprites.damageNoteRight,
        fallback: {
            left: skin.sprites.damageNoteFallbackLeft,
            middle: skin.sprites.damageNoteFallbackMiddle,
            right: skin.sprites.damageNoteFallbackRight,
        },
        secondaryFallback: skin.sprites.damageNoteSecondaryFallback,
    }
}
