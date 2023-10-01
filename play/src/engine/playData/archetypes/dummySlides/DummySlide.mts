import { options } from '../../../configuration/options.mjs'
import { archetypes } from '../index.mjs'
import { layer } from '../layer.mjs'
import { Note } from '../notes/Note.mjs'
import { EaseType, ease } from '../slideConnectors/EaseType.mjs'
import { getScheduleSFXTime, getZ, scaledTimeToEarliestTime, timeToScaledTime } from '../utils.mjs'

export abstract class DummySlide extends Archetype {
    abstract sprites: {
        normal: SkinSprite
        fallback: SkinSprite
        secondaryFallback: SkinSprite
    }
    leniency = 1

    data = this.defineData({
        startRef: { name: 'start', type: Number },
        headRef: { name: 'head', type: Number },
        tailRef: { name: 'tail', type: Number },
        endRef: { name: 'end', type: Number },
        ease: { name: 'ease', type: DataType<EaseType> },
        noFade: { name: 'noFade', type: Boolean },
    })

    start = this.entityMemory({
        time: Number,
        scaledTime: Number,
    })
    end = this.entityMemory({
        time: Number,
        scaledTime: Number,
    })
    head = this.entityMemory({
        time: Number,
        lane: Number,
        scaledTime: Number,

        l: Number,
        r: Number,
    })
    tail = this.entityMemory({
        time: Number,
        lane: Number,
        scaledTime: Number,

        l: Number,
        r: Number,
    })

    scheduleSFXTime = this.entityMemory(Number)

    visualTime = this.entityMemory({
        min: Number,
        hidden: Number,
    })

    spawnTime = this.entityMemory(Number)

    hasSFXScheduled = this.entityMemory(Boolean)

    sfxInstanceId = this.entityMemory(LoopedEffectClipInstanceId)
    effectInstanceIds = this.entityMemory({
        circular: ParticleEffectInstanceId,
        linear: ParticleEffectInstanceId,
    })

    connector = this.entityMemory({
        z: Number,
    })

    slide = this.entityMemory({
        z: Number,
    })

    preprocess() {
        this.head.time = bpmChanges.at(this.headData.beat).time
        this.head.scaledTime = timeToScaledTime(this.head.time, this.headData.timeScaleGroup)

        this.scheduleSFXTime = getScheduleSFXTime(this.head.time)

        this.visualTime.min = this.head.scaledTime - Note.duration

        const spawnTime = Math.min(
            this.visualTime.min,
            timeToScaledTime(this.scheduleSFXTime, this.headData.timeScaleGroup)
        )

        this.spawnTime = Math.min(
            scaledTimeToEarliestTime(spawnTime, this.headData.timeScaleGroup),
            scaledTimeToEarliestTime(spawnTime, this.tailData.timeScaleGroup)
        )

        this.start.time = bpmChanges.at(this.startData.beat).time
        this.start.scaledTime = timeToScaledTime(this.start.time, this.startData.timeScaleGroup)
        this.end.time = bpmChanges.at(this.endData.beat).time
        this.end.scaledTime = timeToScaledTime(this.end.time, this.endData.timeScaleGroup)

        this.head.lane = this.headData.lane
        this.head.l = this.head.lane - this.headData.size
        this.head.r = this.head.lane + this.headData.size

        this.tail.time = bpmChanges.at(this.tailData.beat).time
        this.tail.lane = this.tailData.lane
        this.tail.scaledTime = timeToScaledTime(this.tail.time, this.tailData.timeScaleGroup)
        this.tail.l = this.tail.lane - this.tailData.size
        this.tail.r = this.tail.lane + this.tailData.size

        if (options.hidden > 0)
            this.visualTime.hidden = this.tail.scaledTime - Note.duration * options.hidden

        this.connector.z = getZ(layer.note.connector, this.head.time, this.headData.lane)

        this.slide.z = getZ(layer.note.slide, this.head.time, this.headData.lane)
    }

    spawnOrder() {
        return 1000 + this.spawnTime
    }

    shouldSpawn() {
        return time.now >= this.spawnTime
    }

    updateSequentialOrder = 1
    updateParallel() {
        if (time.now >= this.tail.time) {
            this.despawn = true
            return
        }
        this.renderConnector()
    }

    get startData() {
        return archetypes.HiddenSlideStartNote.data.get(this.data.startRef)
    }

    get endData() {
        return archetypes.HiddenSlideTickNote.data.get(this.data.endRef)
    }

    get startSharedMemory() {
        return archetypes.HiddenSlideStartNote.sharedMemory.get(this.data.startRef)
    }

    get headData() {
        return archetypes.HiddenSlideTickNote.data.get(this.data.headRef)
    }

    get tailData() {
        return archetypes.HiddenSlideTickNote.data.get(this.data.tailRef)
    }

    renderConnector() {
        if (
            options.hidden > 0 &&
            timeToScaledTime(time.now, this.headData.timeScaleGroup) > this.visualTime.hidden
        )
            return

        const hiddenDuration = options.hidden > 0 ? Note.duration * options.hidden : 0

        const now = timeToScaledTime(time.now, this.headData.timeScaleGroup)

        const visibleTime = {
            min: Math.max(
                this.head.scaledTime,
                time.now > this.head.time ? now + hiddenDuration : now - Note.duration * 1.5
            ),
            max: Math.min(this.tail.scaledTime, now + Note.duration),
        }
        if (visibleTime.min >= visibleTime.max) return

        for (let i = 0; i < 10; i++) {
            const scaledTime = {
                min: Math.lerp(visibleTime.min, visibleTime.max, i / 10),
                max: Math.lerp(visibleTime.min, visibleTime.max, (i + 1) / 10),
            }

            const s = {
                min: this.getScale(scaledTime.min),
                max: this.getScale(scaledTime.max),
            }

            const y = {
                min: Note.approach(scaledTime.min - Note.duration, scaledTime.min, now),
                max: Note.approach(scaledTime.max - Note.duration, scaledTime.max, now),
            }

            const layout = {
                x1: this.getL(s.min) * y.min,
                x2: this.getL(s.max) * y.max,
                x3: this.getR(s.max) * y.max,
                x4: this.getR(s.min) * y.min,
                y1: y.min,
                y2: y.max,
                y3: y.max,
                y4: y.min,
            }

            const alpha = this.data.noFade
                ? 0.5
                : Math.remapClamped(
                      this.start.scaledTime,
                      this.end.scaledTime,
                      0.5,
                      0,
                      scaledTime.min
                  )
            if (this.sprites.normal.exists) {
                this.sprites.normal.draw(layout, this.connector.z, alpha)
            } else if (this.sprites.fallback.exists) {
                this.sprites.fallback.draw(layout, this.connector.z, alpha)
            } else {
                this.sprites.secondaryFallback.draw(layout, this.connector.z, alpha)
            }
        }
    }

    getScale(scaledTime: number) {
        return this.ease(Math.unlerpClamped(this.head.scaledTime, this.tail.scaledTime, scaledTime))
    }

    ease(s: number) {
        return ease(this.data.ease, s)
    }

    getLane(scale: number) {
        return Math.lerp(this.head.lane, this.tail.lane, scale)
    }

    getL(scale: number) {
        return Math.lerp(this.head.l, this.tail.l, scale)
    }

    getR(scale: number) {
        return Math.lerp(this.head.r, this.tail.r, scale)
    }
}
