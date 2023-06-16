import { options } from '~/engine/configuration/options.mjs'
import {
    canStart,
    disallowEmpty,
    disallowEnd,
    disallowStart,
} from '~/engine/data/archetypes/InputManager.mjs'
import { FlatNote } from '../FlatNote.mjs'

export abstract class TraceNote extends FlatNote {
    leniency = 0.75

    touch() {
        if (options.autoplay) return

        for (const touch of touches) {
            if (touch.started && time.now < this.inputTime.min) continue
            if (!touch.started && time.now < this.targetTime) continue
            if (touch.started && !canStart(touch)) continue
            if (!this.hitbox.contains(touch.position)) continue

            this.complete(touch)
            return
        }
    }

    complete(touch: Touch) {
        // disallowEmpty(touch)
        // disallowStart(touch)
        // disallowEnd(touch, this.inputTime.max)

        this.result.judgment = Judgment.Perfect
        this.result.accuracy = 0

        this.result.bucket.index = this.bucket.index
        this.result.bucket.value = this.result.accuracy * 1000

        this.playHitEffects(touch.startTime)

        this.despawn = true
    }
}
