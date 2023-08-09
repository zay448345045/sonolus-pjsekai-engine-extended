import { buckets } from '~/engine/playData/buckets.mjs'
import { effect } from '~/engine/playData/effect.mjs'
import { particle } from '~/engine/playData/particle.mjs'
import { skin } from '~/engine/playData/skin.mjs'
import { options } from '../../../../../configuration/options.mjs'
import { canTraceStart } from '../../../InputManager.mjs'
import { note } from '../../../constants.mjs'
import { archetypes } from '../../../index.mjs'
import { scaledScreen } from '../../../shared.mjs'
import { perspectiveLayout } from '../../../utils.mjs'
import { windows } from '../../../windows.mjs'
import { SlimNote } from '../SlimNote.mjs'

export class TraceSlideEndNote extends SlimNote {
    leniency = 0.75
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

    tickSpriteLayout = this.entityMemory(Quad)

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
        if (options.autoplay) return

        for (const touch of touches) {
            if (touch.started && time.now < this.inputTime.min) continue
            if (!touch.started && time.now < this.targetTime) continue
            if (touch.started && !canTraceStart(touch)) continue
            if (!this.hitbox.contains(touch.position)) continue

            this.complete(touch)
            return
        }
    }

    render(): void {
        super.render()

        if (this.useFallbackTickSprite) {
            this.tickSprites.fallback.draw(this.tickSpriteLayout.mul(this.y), this.z + 1, 1)
        } else {
            this.tickSprites.tick.draw(this.tickSpriteLayout.mul(this.y), this.z + 1, 1)
        }
    }

    complete(touch: Touch) {
        this.result.judgment = Judgment.Perfect
        this.result.accuracy = 0

        this.result.bucket.index = this.bucket.index
        this.result.bucket.value = this.result.accuracy * 1000

        this.playHitEffects(touch.startTime)

        this.despawn = true
    }
}
