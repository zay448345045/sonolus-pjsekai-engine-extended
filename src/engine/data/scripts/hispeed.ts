import { Add, And, createEntityData, GreaterOr, Pointer, Script, Time } from 'sonolus.js'
import {
    calculateHispeedTime,
    firstHispeedIndex,
    HispeedAllocatorSharedMemory,
    HispeedSharedMemory,
} from './common/hispeed'
import { applyLevelSpeed } from './common/note'

export class HispeedAllocatorDataPointer extends Pointer {
    public get entityCount() {
        return this.to<number>(0)
    }

    public get firstEntity() {
        return this.to<number>(1)
    }
}
const HispeedAllocatorData = createEntityData(HispeedAllocatorDataPointer)

export class HispeedDataPointer extends Pointer {
    public get group() {
        return this.to<number>(0)
    }

    public get time() {
        return this.to<number>(1)
    }

    public get value() {
        return this.to<number>(2)
    }

    public get toManager() {
        return HispeedAllocatorSharedMemory.of(Add(firstHispeedIndex, this.group))
    }
}
const HispeedData = createEntityData(HispeedDataPointer)

export function hispeed(isAllocator: boolean): Script {
    const spawnOrder = isAllocator ? -1000 : -900

    if (isAllocator) {
        return {
            spawnOrder,
            preprocess: [
                HispeedAllocatorSharedMemory.value.set(1),
                HispeedAllocatorSharedMemory.firstEntity.set(HispeedAllocatorData.firstEntity),
                HispeedAllocatorSharedMemory.entityCount.set(HispeedAllocatorData.entityCount),
            ],
            updateParallel: [],
        }
    }

    const preprocess = [
        applyLevelSpeed(HispeedData.time),
        HispeedSharedMemory.time.set(HispeedData.time),
        HispeedSharedMemory.value.set(HispeedData.value),
    ]

    const updateSequential = [
        And(GreaterOr(Time, HispeedData.time), [
            HispeedData.toManager.lastEndTime.set(
                calculateHispeedTime(HispeedData.group, HispeedData.time)
            ),
            HispeedData.toManager.value.set(HispeedData.value),
            HispeedData.toManager.startTime.set(HispeedData.time),
            true,
        ]),
    ]
    return {
        spawnOrder,
        preprocess,
        updateSequential,
    }
}
