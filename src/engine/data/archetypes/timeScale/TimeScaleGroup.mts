export class TimeScaleGroup extends Archetype {
    data = this.defineData({
        firstRef: { name: 'first', type: Number },
        length: { name: 'length', type: Number },
    })

    initialize() {
        this.despawn = true
    }
}
