import {
    Add,
    Code,
    createEntityData,
    createEntitySharedMemory,
    GreaterOr,
    If,
    LevelMemory,
    Pointer,
    Remap,
    Time,
} from 'sonolus.js'

export class HispeedAllocatorSharedMemoryPointer extends Pointer {
    public get value() {
        return this.to<number>(0)
    }

    public get startTime() {
        return this.to<number>(1)
    }

    public get endTime() {
        return this.to<number>(2)
    }

    public get startComputedTime() {
        return this.to<number>(3)
    }

    public get endComputedTime() {
        return this.to<number>(4)
    }
}
export const HispeedAllocatorSharedMemory = createEntitySharedMemory(
    HispeedAllocatorSharedMemoryPointer
)
export class HispeedDataPointer extends Pointer {
    public get group() {
        return this.to<number>(0)
    }

    public get value() {
        return this.to<number>(1)
    }

    public get startTime() {
        return this.to<number>(2)
    }

    public get endTime() {
        return this.to<number>(3)
    }

    public get startComputedTime() {
        return this.to<number>(4)
    }

    public get endComputedTime() {
        return this.to<number>(5)
    }

    public get toManager() {
        return HispeedAllocatorSharedMemory.of(Add(firstHispeedIndex, this.group))
    }
}
export const HispeedData = createEntityData(HispeedDataPointer)

export class HispeedAllocatorDataPointer extends Pointer {
    public get entityCount() {
        return this.to<number>(0)
    }

    public get firstEntity() {
        return this.to<number>(1)
    }
}
export const HispeedAllocatorData = createEntityData(HispeedAllocatorDataPointer)

export const getAllocator = (group: Code<number>) =>
    HispeedAllocatorSharedMemory.of(Add(firstHispeedIndex, group))
export const calculateHispeedTime = (group: Code<number>, time: Code<number> = Time) => {
    const hispeed = getAllocator(group)
    return If(
        levelHasHispeed,

        If(
            GreaterOr(time, 0),
            Remap(
                hispeed.startTime,
                hispeed.endTime,
                hispeed.startComputedTime,
                hispeed.endComputedTime,
                time
            ),
            time
        ),
        time
    )
}

export const getHispeed = (group: Code<number>) => {
    const hispeed = getAllocator(group)
    return If(levelHasHispeed, hispeed.value, 1)
}

export const levelHasHispeed = LevelMemory.to<boolean>(133)
export const firstHispeedIndex = LevelMemory.to<number>(134)
