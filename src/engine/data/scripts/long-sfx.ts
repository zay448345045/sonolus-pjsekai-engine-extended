import { And, EntityMemory, Equal, If, NotEqual, PlayLooped, Script, StopLooped } from 'sonolus.js'
import { criticalHoldSFXCount, getHoldClip, holdSFXCount } from './common/sfx'

export function longSfx(): Script {
    const previousIsHoldPlaying = EntityMemory.to<boolean>(0)
    const previousIsCriticalHoldPlaying = EntityMemory.to<boolean>(1)
    const holdSFXId = EntityMemory.to<number>(2)
    const criticalHoldSFXId = EntityMemory.to<number>(3)

    const updateParallel = [
        ...(
            [
                [holdSFXCount, previousIsHoldPlaying, holdSFXId, getHoldClip(false)],
                [
                    criticalHoldSFXCount,
                    previousIsCriticalHoldPlaying,
                    criticalHoldSFXId,
                    getHoldClip(true),
                ],
            ] as const
        ).map(([current, previous, sfxId, sfx]) => [
            If(
                previous.get(),
                And(Equal(current.get(), 0), [previous.set(false), StopLooped(sfxId.get())]),
                And(NotEqual(current.get(), 0), [previous.set(true), sfxId.set(PlayLooped(sfx))])
            ),
        ]),
    ]
    return {
        updateParallel,
    }
}
