import { note } from '../../../note.mjs'
import { panel } from '../../../panel.mjs'
import { getZ, layer } from '../../../skin.mjs'
import { Note } from '../Note.mjs'

export abstract class SlimNote extends Note {
    abstract sprites: {
        left: SkinSprite
        middle: SkinSprite
        right: SkinSprite
        fallback: {
            left: SkinSprite
            middle: SkinSprite
            right: SkinSprite
        }
        secondaryFallback: SkinSprite
    }

    render() {
        const time = bpmChanges.at(this.data.beat).time
        const pos = panel.getPos(time)

        const z = getZ(layer.note.body, time, this.data.lane)

        const l = this.data.lane - this.data.size
        const r = this.data.lane + this.data.size
        const b = -note.h / 2
        const t = note.h / 2

        if (this.useSecondaryFallbackSprites) {
            this.sprites.secondaryFallback.draw(new Rect({ l, r, b, t }).add(pos), z, 1)
        } else if (this.useFallbackSprites) {
            const ml = l + 0.125
            const mr = r - 0.125

            this.sprites.fallback.left.draw(new Rect({ l, r: ml, b, t }).add(pos), z, 1)
            this.sprites.fallback.middle.draw(new Rect({ l: ml, r: mr, b, t }).add(pos), z, 1)
            this.sprites.fallback.right.draw(new Rect({ l: mr, r, b, t }).add(pos), z, 1)
        } else {
            const ml = l + 0.125
            const mr = r - 0.125

            this.sprites.left.draw(new Rect({ l, r: ml, b, t }).add(pos), z, 1)
            this.sprites.middle.draw(new Rect({ l: ml, r: mr, b, t }).add(pos), z, 1)
            this.sprites.right.draw(new Rect({ l: mr, r, b, t }).add(pos), z, 1)
        }

        return { time, pos }
    }

    get useFallbackSprites() {
        return (
            (!this.sprites.left.exists ||
                !this.sprites.middle.exists ||
                !this.sprites.right.exists) &&
            this.sprites.fallback.left.exists &&
            this.sprites.fallback.middle.exists &&
            this.sprites.fallback.right.exists
        )
    }

    get useSecondaryFallbackSprites() {
        return (
            !this.sprites.fallback.left.exists ||
            !this.sprites.fallback.middle.exists ||
            !this.sprites.fallback.right.exists
        )
    }
}
