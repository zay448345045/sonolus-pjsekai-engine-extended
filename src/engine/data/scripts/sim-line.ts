import { SkinSprite } from 'sonolus-core'
import {
    And,
    Draw,
    EntityInfo,
    EntityMemory,
    Equal,
    GreaterOr,
    If,
    Lerp,
    Max,
    Multiply,
    Or,
    Script,
    State,
    Subtract,
    Switch,
    Time,
} from 'sonolus.js'
import { options } from '../../configuration/options'
import { archetypes } from '../archetypes'
import { baseNote, lane, Layer, noteFirstAppearY, origin } from './common/constants'
import { calculateHispeedTime, levelHasHispeed } from './common/hispeed'
import { approach, getVisibleTime, getZ, isNotHidden, NoteData } from './common/note'
import { rectByEdge } from './common/utils'

export function simLine(): Script {
    const rIndex = EntityMemory.to<number>(0)
    const lIndex = Subtract(rIndex, 1)

    const time = EntityMemory.to<number>(1)
    const visibleTime = EntityMemory.to<number>(2)
    const isSlide = EntityMemory.to<boolean>(3)

    const lineL = EntityMemory.to<number>(4)
    const lineR = EntityMemory.to<number>(5)

    const lineScaleL = EntityMemory.to<number>(6)
    const lineScaleR = EntityMemory.to<number>(7)
    const lineBL = EntityMemory.to<number>(8)
    const lineBR = EntityMemory.to<number>(9)
    const lineTL = EntityMemory.to<number>(10)
    const lineTR = EntityMemory.to<number>(11)

    const z = EntityInfo.to<number>(12)

    const lTime = EntityMemory.to<number>(13)
    const rTime = EntityMemory.to<number>(14)

    const initialize = [
        If(
            levelHasHispeed,
            [
                time.set(NoteData.of(lIndex).time),
                lTime.set(NoteData.of(lIndex).hispeedTime),
                rTime.set(NoteData.of(rIndex).hispeedTime),
            ],
            [time.set(NoteData.of(lIndex).time)]
        ),
        visibleTime.set(getVisibleTime(time)),
        isSlide.set(
            Or(
                ...[lIndex, rIndex].map((index) =>
                    Switch(
                        EntityInfo.of(index).archetype,
                        [archetypes.slideStartIndex, archetypes.criticalSlideStartIndex].map(
                            (archetype) => [archetype, true]
                        ),
                        false
                    )
                )
            )
        ),

        lineL.set(Multiply(NoteData.of(lIndex).center, lane.w)),
        lineR.set(Multiply(NoteData.of(rIndex).center, lane.w)),

        z.set(getZ(Layer.SimLine, time, rIndex)),
    ]

    const updateParallel = Or(
        And(options.isAutoplay, GreaterOr(Time, time)),
        And(isSlide, GreaterOr(Time, time)),
        Equal(EntityInfo.of(lIndex).state, State.Despawned),
        Equal(EntityInfo.of(rIndex).state, State.Despawned),
        And(Or(levelHasHispeed, GreaterOr(Time, visibleTime)), isNotHidden(lTime), [
            lineScaleL.set(approach(lTime, NoteData.of(lIndex).hispeedGroup)),
            lineBL.set(Lerp(origin, baseNote.b, lineScaleL)),
            lineTL.set(Lerp(origin, baseNote.t, lineScaleL)),
            And(levelHasHispeed, [
                lineScaleR.set(approach(rTime, NoteData.of(rIndex).hispeedGroup)),
                lineBR.set(Lerp(origin, baseNote.b, lineScaleR)),
                lineTR.set(Lerp(origin, baseNote.t, lineScaleR)),
            ]),

            If(
                levelHasHispeed,
                And(
                    GreaterOr(lineScaleL, noteFirstAppearY),
                    GreaterOr(lineScaleR, noteFirstAppearY),

                    Draw(
                        SkinSprite.SimultaneousConnectionNeutral,
                        Multiply(lineL, lineScaleL),
                        lineBL,
                        Multiply(lineL, lineScaleL),
                        lineTL,
                        Multiply(lineR, lineScaleR),
                        lineTR,
                        Multiply(lineR, lineScaleR),
                        lineBR,
                        Max(
                            getZ(
                                Layer.SimLine,

                                calculateHispeedTime(NoteData.of(lIndex).hispeedGroup, lTime),
                                lIndex
                            ),
                            getZ(
                                Layer.SimLine,
                                calculateHispeedTime(NoteData.of(rIndex).hispeedGroup, lTime),
                                rIndex
                            )
                        ),
                        1
                    )
                ),
                Draw(
                    SkinSprite.SimultaneousConnectionNeutral,
                    ...rectByEdge(
                        Multiply(lineL, lineScaleL),
                        Multiply(lineR, lineScaleL),
                        lineBL,
                        lineTL
                    ),
                    z,
                    1
                )
            ),
        ])
    )

    return {
        initialize,
        updateParallel,
    }
}
