import {
    Add,
    Code,
    createEntitySharedMemory,
    If,
    LevelMemory,
    Multiply,
    Pointer,
    Subtract,
    Time,
} from 'sonolus.js'

export class HispeedAllocatorSharedMemoryPointer extends Pointer {
    public get value() {
        return this.to<number>(0)
    }

    public get startTime() {
        return this.to<number>(1)
    }

    public get lastEndTime() {
        return this.to<number>(2)
    }

    public get firstEntity() {
        return this.to<number>(3)
    }

    public get toFirstEntity() {
        return HispeedSharedMemory.of(this.firstEntity)
    }

    public get entityCount() {
        return this.to<number>(4)
    }
}
export const HispeedAllocatorSharedMemory = createEntitySharedMemory(
    HispeedAllocatorSharedMemoryPointer
)

export class HispeedSharedMemoryPointer extends Pointer {
    public get value() {
        return this.to<number>(0)
    }

    public get time() {
        return this.to<number>(1)
    }
}
export const HispeedSharedMemory = createEntitySharedMemory(HispeedSharedMemoryPointer)
export const getAllocator = (group: Code<number>) =>
    HispeedAllocatorSharedMemory.of(Add(firstHispeedIndex, group))
export const calculateHispeedTime = (group: Code<number>, time: Code<number> = Time) => {
    const hispeed = getAllocator(group)
    return If(
        levelHasHispeed,

        Add(hispeed.lastEndTime, Multiply(Subtract(time, hispeed.startTime), hispeed.value)),
        time
    )
}

export const getHispeed = (group: Code<number>) => {
    const hispeed = getAllocator(group)
    return If(levelHasHispeed, hispeed.value, 1)
}

export const levelHasHispeed = LevelMemory.to<boolean>(133)
export const firstHispeedIndex = LevelMemory.to<number>(134)
