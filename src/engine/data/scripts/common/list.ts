import { Add, And, Code, DataType, Equal, Less, Or, Pointer, SwitchInteger } from 'sonolus.js'

export class List<T extends DataType> {
    private readonly pointer: Pointer
    private readonly count: Pointer<number>
    private readonly buffer: Pointer<T>
    private readonly size: number

    public constructor(pointer: Pointer, size: number) {
        this.pointer = pointer
        this.count = pointer.to(0)
        this.buffer = pointer.to(1)
        this.size = size
    }

    public clear() {
        return this.count.set(0)
    }

    public add(value: Code<T>) {
        return SwitchInteger(
            this.count,
            [...Array(this.size).keys()].map((i) => [
                this.buffer.to(i).set(value),
                this.count.set(Add(this.count, 1)),
            ])
        )
    }

    public contains(value: Code<T>) {
        return Or(
            ...[...Array(this.size).keys()].map((i) =>
                And(Less(i, this.count), Equal(value, this.buffer.to(i)))
            )
        )
    }

    public copyTo(list: List<T>) {
        return [...Array(this.size + 1).keys()].map((i) =>
            list.pointer.to(i).set(this.pointer.to(i))
        )
    }
}

export class KVList<T extends DataType> {
    public readonly pointer: Pointer
    public readonly count: Pointer<number>
    private readonly buffer: Pointer<T>
    private readonly size: number

    public constructor(pointer: Pointer, size: number) {
        this.pointer = pointer
        this.count = pointer.to(0)
        this.buffer = pointer.to(1)
        this.size = size
    }

    public clear() {
        return this.count.set(0)
    }

    public add(value1: Code<T>, value2: Code<T>) {
        return SwitchInteger(
            this.count,
            [...Array(this.size * 2).keys()]
                .filter((i) => i % 2 == 0)
                .map((i) => [
                    this.buffer.to(i).set(value1),
                    this.buffer.to(i + 1).set(value2),
                    this.count.set(Add(this.count, 1)),
                ])
        )
    }

    public contains(value: Code<T>) {
        return Or(
            ...[...Array(this.size * 2).keys()].map((i) =>
                And(Less(i, this.count), Equal(value, this.buffer.to(i * 2)))
            )
        )
    }

    public copyTo(list: KVList<T>) {
        return [...Array(this.size * 2 + 1).keys()].map((i) =>
            list.pointer.to(i).set(this.pointer.to(i))
        )
    }

    public value(value: Code<T>): Code<number> {
        // @ts-expect-error Code<boolean> vs Code<number>
        return Or(
            ...[...Array(this.size).keys()].map((i) =>
                And(
                    Less(i, this.count),
                    Equal(value, this.buffer.to(i * 2)),
                    this.buffer.to(i * 2 + 1)
                )
            )
        )
    }
}
