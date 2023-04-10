import { And, GreaterOr, Script, Time } from 'sonolus.js'
import { HispeedAllocatorSharedMemory, HispeedData } from './common/hispeed'
import { applyLevelSpeed } from './common/note'

export function hispeed(isAllocator: boolean): Script {
    const spawnOrder = isAllocator ? -1000 : -900

    if (isAllocator) {
        return {
            spawnOrder,
            preprocess: [HispeedAllocatorSharedMemory.value.set(1)],
            updateParallel: [],
        }
    }

    const preprocess = [
        applyLevelSpeed(HispeedData.startTime),
        applyLevelSpeed(HispeedData.endTime),
        applyLevelSpeed(HispeedData.startComputedTime),
        applyLevelSpeed(HispeedData.endComputedTime),
    ]

    const updateSequential = [
        And(GreaterOr(Time, HispeedData.startTime), [
            HispeedData.toManager.startTime.set(HispeedData.startTime),
            HispeedData.toManager.endTime.set(HispeedData.endTime),
            HispeedData.toManager.startComputedTime.set(HispeedData.startComputedTime),
            HispeedData.toManager.endComputedTime.set(HispeedData.endComputedTime),

            true,
        ]),
    ]
    return {
        spawnOrder,
        preprocess,
        updateSequential,
    }
}
