import { note } from '~/engine/data/archetypes/constants.mjs'
import { perspectiveLayout } from '~/engine/data/archetypes/utils.mjs'
import { FlatNote } from './FlatNote.mjs'

export abstract class SlimNote extends FlatNote {
    setLayout({ l, r }: { l: number; r: number }) {
        const b = 1 + note.h / 2
        const t = 1 - note.h / 2

        if (this.useSingleFallbackSprites) {
            perspectiveLayout({ l, r, b, t }).copyTo(this.spriteLayouts.middle)
        } else {
            const ml = l + 0.125
            const mr = r - 0.125

            perspectiveLayout({ l, r: ml, b, t }).copyTo(this.spriteLayouts.left)
            perspectiveLayout({ l: ml, r: mr, b, t }).copyTo(this.spriteLayouts.middle)
            perspectiveLayout({ l: mr, r, b, t }).copyTo(this.spriteLayouts.right)
        }
    }
}
