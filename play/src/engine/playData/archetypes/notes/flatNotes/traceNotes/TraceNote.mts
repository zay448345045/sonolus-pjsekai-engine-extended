import { options } from '~/engine/configuration/options.mjs'
import {
    canTraceStart,
    claimStart,
    disallowEmpty,
    disallowTraceStart,
} from '~/engine/playData/archetypes/InputManager.mjs'
import { note } from '~/engine/playData/archetypes/constants.mjs'
import { scaledScreen } from '~/engine/playData/archetypes/shared.mjs'
import { perspectiveLayout } from '~/engine/playData/archetypes/utils.mjs'
import { SlimNote } from '../SlimNote.mjs'

export abstract class TraceNote extends SlimNote {
    leniency = 1
    abstract tickSprites: {
        tick: SkinSprite
        fallback: SkinSprite
    }
    tickSpriteLayout = this.entityMemory(Quad)

    initialize() {
        super.initialize()
        this.inputTime.min = this.targetTime + this.windows.great.min + input.offset
        this.inputTime.max = this.targetTime + this.windows.great.max + input.offset
    }

    updateSequential() {
        if (time.now < this.inputTime.min) return

        claimStart(this.info.index, this.targetTime, this.hitbox, this.fullHitbox)
    }

    setLayout({ l, r }: { l: number; r: number }): void {
        super.setLayout({ l, r })

        const b = 1 + note.h
        const t = 1 - note.h

        if (this.useFallbackTickSprite) {
            const l = this.data.lane - this.data.size
            const r = this.data.lane + this.data.size

            perspectiveLayout({ l, r, b, t }).copyTo(this.tickSpriteLayout)
        } else {
            const w = note.h / scaledScreen.wToH

            new Rect({
                l: this.data.lane - w,
                r: this.data.lane + w,
                b,
                t,
            })
                .toQuad()
                .copyTo(this.tickSpriteLayout)
        }
    }

    get useFallbackTickSprite() {
        return !this.tickSprites.tick.exists
    }
    globalPreprocess() {
        super.globalPreprocess()
        this.life.miss = -40
    }

    touch() {
        for (const touch of touches) {
            if (touch.started && time.now < this.inputTime.min) continue
            if (!touch.started && time.now < this.targetTime) continue
            if (touch.started && !canTraceStart(touch)) continue
            if (!this.fullHitbox.contains(touch.position)) continue

            this.complete(touch)
            return
        }
    }

    render(): void {
        if (!options.showNotes) return
        super.render()

        if (this.useFallbackTickSprite) {
            this.tickSprites.fallback.draw(this.tickSpriteLayout.mul(this.y), this.z + 1, 1)
        } else {
            this.tickSprites.tick.draw(this.tickSpriteLayout.mul(this.y), this.z + 1, 1)
        }
    }

    complete(touch: Touch) {
        disallowEmpty(touch)
        disallowTraceStart(touch)
        // disallowEnd(touch, this.inputTime.max)

        this.result.judgment = Judgment.Perfect
        this.result.accuracy = 0

        this.result.bucket.index = this.bucket.index
        this.result.bucket.value = this.result.accuracy * 1000

        this.playHitEffects(touch.startTime)

        this.despawn = true
    }
}
