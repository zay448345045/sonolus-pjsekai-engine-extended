import { options } from '~/engine/configuration/options.mjs'
import { Note } from '../../Note.mjs'

export class HiddenSlideStartNote extends Note {
    leniency = 1

    sharedMemory = this.defineSharedMemory({
        lastActiveTime: Number,
    })

    preprocess() {
        this.sharedMemory.lastActiveTime = -1000
        if (options.mirror) this.data.lane *= -1
    }

    spawnOrder() {
        return 100000
    }

    shouldSpawn() {
        return false
    }
}
