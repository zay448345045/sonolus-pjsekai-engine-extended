import { SlideTickNote } from './SlideTickNote.mjs'
import { getAttached } from './utils.mjs'

export class IgnoredSlideTickNote extends SlideTickNote {
    attachedSlideTickData = this.defineData({
        attachRef: { name: 'attach', type: Number },
    })

    preprocessOrder = 1
    preprocess() {
        super.preprocess()
        ;({ lane: this.data.lane, size: this.data.size } = getAttached(
            this.attachedSlideTickData.attachRef,
            this.targetTime,
        ))
    }
}
