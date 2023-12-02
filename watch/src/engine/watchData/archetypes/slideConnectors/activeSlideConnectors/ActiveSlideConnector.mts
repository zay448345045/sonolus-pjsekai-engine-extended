import { SlideStartType } from '~shared/engine/data/SlideStartType.mjs'
import { perspectiveLayout } from '../../../../../../../shared/src/engine/data/utils.mjs'
import { options } from '../../../../configuration/options.mjs'
import { effect } from '../../../effect.mjs'
import { note } from '../../../note.mjs'
import { circularEffectLayout, linearEffectLayout, particle } from '../../../particle.mjs'
import { scaledScreen } from '../../../scaledScreen.mjs'
import { getZ, layer } from '../../../skin.mjs'
import { SlideConnector } from '../SlideConnector.mjs'

export abstract class ActiveSlideConnector extends SlideConnector {
    abstract sprites: {
        normal: SkinSprite
        active: SkinSprite
        fallback: SkinSprite

        slide: {
            left: SkinSprite
            middle: SkinSprite
            right: SkinSprite
            fallback: SkinSprite
        }
        traceSlide: {
            left: SkinSprite
            middle: SkinSprite
            right: SkinSprite
            fallback: SkinSprite
        }
        traceSlideTick: {
            tick: SkinSprite
            fallback: SkinSprite
        }
    }

    abstract clips: {
        hold: EffectClip
        fallback: EffectClip
    }

    abstract effects: {
        circular: ParticleEffect
        linear: ParticleEffect
    }

    effectInstanceIds = this.entityMemory({
        circular: ParticleEffectInstanceId,
        linear: ParticleEffectInstanceId,
    })

    slideZ = this.entityMemory(Number)

    preprocess() {
        super.preprocess()

        if (options.sfxEnabled) {
            const id =
                'fallback' in this.clips && this.useFallbackClip
                    ? this.clips.fallback.scheduleLoop(this.head.time)
                    : this.clips.hold.scheduleLoop(this.head.time)
            effect.clips.scheduleStopLoop(id, this.tail.time)
        }
    }

    updateParallel() {
        super.updateParallel()

        if (time.skip) {
            if (this.shouldScheduleCircularEffect) this.effectInstanceIds.circular = 0

            if (this.shouldScheduleLinearEffect) this.effectInstanceIds.linear = 0
        }

        if (time.now < this.head.time) return

        if (this.shouldScheduleCircularEffect && !this.effectInstanceIds.circular)
            this.spawnCircularEffect()

        if (this.shouldScheduleLinearEffect && !this.effectInstanceIds.linear)
            this.spawnLinearEffect()

        if (this.effectInstanceIds.circular) this.updateCircularEffect()

        if (this.effectInstanceIds.linear) this.updateLinearEffect()

        this.renderSlide()
    }

    terminate() {
        if (this.shouldScheduleCircularEffect && this.effectInstanceIds.circular)
            this.destroyCircularEffect()

        if (this.shouldScheduleLinearEffect && this.effectInstanceIds.linear)
            this.destroyLinearEffect()
    }

    get useFallbackSlideSprites() {
        return (
            !this.sprites.slide.left.exists ||
            !this.sprites.slide.middle.exists ||
            !this.sprites.slide.right.exists
        )
    }

    get useFallbackTraceSlideSprites() {
        return (
            !this.sprites.traceSlide.left.exists ||
            !this.sprites.traceSlide.middle.exists ||
            !this.sprites.traceSlide.right.exists
        )
    }

    get useFallbackTraceTickSprites() {
        return !this.sprites.traceSlideTick.tick.exists
    }

    get useFallbackClip() {
        return !this.clips.hold.exists
    }

    get shouldScheduleCircularEffect() {
        return options.noteEffectEnabled && this.effects.circular.exists
    }

    get shouldScheduleLinearEffect() {
        return options.noteEffectEnabled && this.effects.linear.exists
    }

    globalInitialize() {
        super.globalInitialize()

        this.slideZ = getZ(layer.note.slide, this.head.time, this.headData.lane)
    }

    getAlpha() {
        return 1
    }

    renderSlide() {
        if (!options.showNotes) return
        if (this.data.startType === SlideStartType.None) return
        const s = this.getScale(time.scaled)

        const l = this.getL(s)
        const r = this.getR(s)
        const lane = this.getLane(s)
        const b = 1 + note.h
        const t = 1 - note.h

        if (this.data.startType !== SlideStartType.Trace) {
            const fb = 1 + note.h / 2
            const ft = 1 - note.h

            if (this.useFallbackSlideSprites) {
                this.sprites.traceSlide.fallback.draw(
                    perspectiveLayout({ l, r, b: fb, t: ft }),
                    this.slideZ,
                    1
                )
            } else {
                const ml = l + 0.125
                const mr = r - 0.125

                this.sprites.traceSlide.left.draw(
                    perspectiveLayout({ l, r: ml, b, t }),
                    this.slideZ,
                    1
                )
                this.sprites.traceSlide.middle.draw(
                    perspectiveLayout({ l: ml, r: mr, b, t }),
                    this.slideZ,
                    1
                )
                this.sprites.traceSlide.right.draw(
                    perspectiveLayout({ l: mr, r, b, t }),
                    this.slideZ,
                    1
                )
            }
            if (this.useFallbackTraceTickSprites) {
                this.sprites.traceSlideTick.fallback.draw(
                    perspectiveLayout({ l, r, b, t }),
                    this.slideZ + 1,
                    1
                )
            } else {
                const w = note.h / scaledScreen.wToH
                this.sprites.traceSlideTick.tick.draw(
                    new Rect({
                        l: lane - w,
                        r: lane + w,
                        b,
                        t,
                    }).toQuad(),
                    this.slideZ + 1,
                    1
                )
            }
        } else {
            if (this.useFallbackSlideSprites) {
                this.sprites.slide.fallback.draw(perspectiveLayout({ l, r, b, t }), this.slideZ, 1)
            } else {
                const ml = l + 0.25
                const mr = r - 0.25

                this.sprites.slide.left.draw(perspectiveLayout({ l, r: ml, b, t }), this.slideZ, 1)
                this.sprites.slide.middle.draw(
                    perspectiveLayout({ l: ml, r: mr, b, t }),
                    this.slideZ,
                    1
                )
                this.sprites.slide.right.draw(perspectiveLayout({ l: mr, r, b, t }), this.slideZ, 1)
            }
        }
    }

    spawnCircularEffect() {
        this.effectInstanceIds.circular = this.effects.circular.spawn(new Quad(), 1, true)
    }

    updateCircularEffect() {
        const s = this.getScale(time.scaled)
        const lane = this.getLane(s)

        particle.effects.move(
            this.effectInstanceIds.circular,
            circularEffectLayout({
                lane,
                w: 3.5,
                h: 2.1,
            })
        )
    }

    destroyCircularEffect() {
        particle.effects.destroy(this.effectInstanceIds.circular)
        this.effectInstanceIds.circular = 0
    }

    spawnLinearEffect() {
        this.effectInstanceIds.linear = this.effects.linear.spawn(new Quad(), 1, true)
    }

    updateLinearEffect() {
        const s = this.getScale(time.scaled)
        const lane = this.getLane(s)

        particle.effects.move(
            this.effectInstanceIds.linear,
            linearEffectLayout({
                lane,
                shear: 0,
            })
        )
    }

    destroyLinearEffect() {
        particle.effects.destroy(this.effectInstanceIds.linear)
        this.effectInstanceIds.linear = 0
    }
}
