import StreamBuffer from 'streambuf'

const flickType = ['none', 'up', 'right', 'left'] as const
type FlickType = (typeof flickType)[number]
const stepType = ['visible', 'hidden', 'ignored'] as const
type StepType = (typeof stepType)[number]
const easeType = ['linear', 'easeIn', 'easeOut'] as const
type EaseType = (typeof easeType)[number]

export type Score = {
    metadata: {
        title: string
        author: string
        artist: string
        musicFile: string
        musicOffset: number
        jacketFile: string
    }
    events: {
        timeSignatures: {
            measure: number
            numerator: number
            denominator: number
        }[]
        bpmChanges: {
            tick: number
            bpm: number
        }[]
        hispeedChanges: {
            tick: number
            speed: number
        }[]
        skills: number[]
        fever: {
            start: number
            end: number
        }
    }
    taps: {
        tick: number
        lane: number
        width: number
        flickType: FlickType
        critical: boolean
    }[]
    holds: {
        critical: boolean
        start: {
            tick: number
            lane: number
            width: number
            ease: EaseType
        }
        steps: {
            tick: number
            lane: number
            width: number
            type: StepType
            ease: EaseType
        }[]
        end: {
            tick: number
            lane: number
            width: number
            critical: boolean
            flickType: FlickType
        }
    }[]
}

export const analyze = (mmws: Buffer): Score => {
    const buffer = StreamBuffer.from(mmws)
    const header = buffer.readString()
    if (header !== 'MMWS') {
        throw new Error('Invalid MMWS file')
    }
    const version = buffer.readInt32LE()
    if (version !== 3) {
        throw new Error('Unsupported MMWS version')
    }
    const metadataPointer = buffer.readUInt32LE()
    const eventsPointer = buffer.readUInt32LE()
    const tapsPointer = buffer.readUInt32LE()
    const holdsPointer = buffer.readUInt32LE()

    buffer.seek(metadataPointer)
    const metadata = {
        title: buffer.readString(),
        author: buffer.readString(),
        artist: buffer.readString(),
        musicFile: buffer.readString(),
        musicOffset: buffer.readFloatLE(),
        jacketFile: buffer.readString(),
    }

    buffer.seek(eventsPointer)
    const events: Score['events'] = {
        timeSignatures: [],
        bpmChanges: [],
        hispeedChanges: [],
        skills: [],
        fever: {
            start: 0,
            end: 0,
        },
    }
    const timeSignaturesCount = buffer.readInt32LE()
    for (let i = 0; i < timeSignaturesCount; i++) {
        events.timeSignatures.push({
            measure: buffer.readInt32LE(),
            numerator: buffer.readInt32LE(),
            denominator: buffer.readInt32LE(),
        })
    }
    const bpmChangesCount = buffer.readInt32LE()
    for (let i = 0; i < bpmChangesCount; i++) {
        events.bpmChanges.push({
            tick: buffer.readInt32LE(),
            bpm: buffer.readFloatLE(),
        })
    }
    const hispeedChangesCount = buffer.readInt32LE()
    for (let i = 0; i < hispeedChangesCount; i++) {
        events.hispeedChanges.push({
            tick: buffer.readInt32LE(),
            speed: buffer.readFloatLE(),
        })
    }
    const skillsCount = buffer.readInt32LE()
    for (let i = 0; i < skillsCount; i++) {
        events.skills.push(buffer.readInt32LE())
    }
    events.fever.start = buffer.readInt32LE()
    events.fever.end = buffer.readInt32LE()

    buffer.seek(tapsPointer)

    const taps: Score['taps'] = []
    const tapsCount = buffer.readInt32LE()
    for (let i = 0; i < tapsCount; i++) {
        taps.push({
            tick: buffer.readInt32LE(),

            lane: buffer.readInt32LE(),
            width: buffer.readInt32LE(),
            flickType: flickType[buffer.readInt32LE() as 0 | 1 | 2 | 3],
            critical: buffer.readInt32LE() === 0 ? false : true,
        })
    }

    buffer.seek(holdsPointer)
    const holds: Score['holds'] = []
    const holdsCount = buffer.readInt32LE()
    for (let i = 0; i < holdsCount; i++) {
        const startTick = buffer.readInt32LE()
        const startLane = buffer.readInt32LE()
        const startWidth = buffer.readInt32LE()
        const startEase = easeType[buffer.readInt32LE() as 0 | 1 | 2]
        const critical = buffer.readInt32LE() === 0 ? false : true
        const stepsCount = buffer.readInt32LE()
        const steps: Score['holds'][0]['steps'] = []
        for (let j = 0; j < stepsCount; j++) {
            const tick = buffer.readInt32LE()
            const lane = buffer.readInt32LE()
            const width = buffer.readInt32LE()
            const type = stepType[buffer.readInt32LE() as 0 | 1 | 2]
            buffer.readInt32LE() // unused critical
            const ease = easeType[buffer.readInt32LE() as 0 | 1 | 2]
            steps.push({
                tick,
                lane,
                width,
                type,
                ease,
            })
        }
        const endTick = buffer.readInt32LE()
        const endLane = buffer.readInt32LE()
        const endWidth = buffer.readInt32LE()
        const endCritical = buffer.readInt32LE() === 0 ? false : true
        const endFlickType = flickType[buffer.readInt32LE() as 0 | 1 | 2 | 3]
        holds.push({
            critical,
            start: {
                tick: startTick,
                lane: startLane,
                width: startWidth,
                ease: startEase,
            },
            steps,
            end: {
                tick: endTick,
                lane: endLane,
                width: endWidth,
                critical: endCritical,
                flickType: endFlickType,
            },
        })
    }

    events.timeSignatures.sort((a, b) => a.measure - b.measure)
    events.bpmChanges.sort((a, b) => a.tick - b.tick)
    events.hispeedChanges.sort((a, b) => a.tick - b.tick)
    events.skills.sort((a, b) => a - b)
    taps.sort((a, b) => a.tick - b.tick)
    holds.sort((a, b) => a.start.tick - b.start.tick)

    return {
        metadata,
        events,
        taps,
        holds,
    }
}
