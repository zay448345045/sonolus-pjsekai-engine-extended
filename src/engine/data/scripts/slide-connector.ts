import { customSkinSprite, ParticleEffect, SkinSprite } from 'sonolus-core'
import {
    Abs,
    Add,
    And,
    bool,
    Code,
    createEntityData,
    DeltaTime,
    DestroyParticleEffect,
    Divide,
    Draw,
    EntityInfo,
    EntityMemory,
    Equal,
    Greater,
    GreaterOr,
    HasParticleEffect,
    HasSkinSprite,
    If,
    InputOffset,
    Lerp,
    Less,
    LessOr,
    Max,
    Min,
    MoveParticleEffect,
    Multiply,
    Not,
    NotEqual,
    Or,
    Pointer,
    Power,
    Script,
    SpawnParticleEffect,
    State,
    StopLooped,
    Subtract,
    SwitchInteger,
    Time,
    TouchId,
    TouchX,
    Unlerp,
} from 'sonolus.js'
import { options } from '../../configuration/options'
import {
    baseNote,
    circularHoldEffect,
    lane,
    Layer,
    linearHoldEffect,
    noteFirstAppearY,
    noteOnScreenDuration,
    origin,
} from './common/constants'
import { calculateHispeedTime, levelHasHispeed } from './common/hispeed'
import {
    applyLevelSpeed,
    applyMirrorCenters,
    approach,
    calculateHitbox,
    getSpawnTime,
    getVisibleTime,
    getZ,
    NoteSharedMemory,
} from './common/note'
import {
    calculateNoteLayout,
    getNoteLayout,
    noteGreenSprite,
    noteYellowSprite,
} from './common/note-sprite'
import { criticalHoldSFXCount, holdSFXCount } from './common/sfx'
import { checkTouchXInHitbox, checkTouchYInHitbox } from './common/touch'
import { rectByEdge, udLoop } from './common/utils'
import { disallowEmpties, rotateAngle } from './input'

const leniency = 1

class ConnectorDataPointer extends Pointer {
    public get headTime() {
        return this.to<number>(0)
    }

    public get headCenter() {
        return this.to<number>(1)
    }

    public get headWidth() {
        return this.to<number>(2)
    }

    public get tailTime() {
        return this.to<number>(3)
    }

    public get tailCenter() {
        return this.to<number>(4)
    }

    public get tailWidth() {
        return this.to<number>(5)
    }

    public get easeType() {
        return this.to<number>(6)
    }

    public get headIndex() {
        return If(Equal(this.to<number>(11), 0), this.to<number>(7), this.to<number>(11))
    }

    public get headHispeedGroup() {
        return this.to<number>(7)
    }

    public get headHispeedTime() {
        return this.to<number>(8)
    }

    public get tailHispeedGroup() {
        return this.to<number>(9)
    }

    public get tailHispeedTime() {
        return this.to<number>(10)
    }

    public get headInfo() {
        return EntityInfo.of(this.headIndex)
    }

    public get headSharedMemory() {
        return NoteSharedMemory.of(this.headIndex)
    }
}

const ConnectorData = createEntityData(ConnectorDataPointer)

export function slideConnector(isCritical: boolean): Script {
    const connectionSprite = isCritical
        ? SkinSprite.NoteConnectionYellowSeamless
        : SkinSprite.NoteConnectionGreenSeamless
    const connectionActiveSprite = isCritical
        ? If(
              HasSkinSprite(customSkinSprite(3, 44)),
              customSkinSprite(3, 44),
              customSkinSprite(3, 14)
          )
        : If(
              HasSkinSprite(customSkinSprite(3, 42)),
              customSkinSprite(3, 42),
              customSkinSprite(3, 12)
          )

    const noteSprite = isCritical ? noteYellowSprite : noteGreenSprite
    const circularEffect = isCritical
        ? ParticleEffect.NoteCircularHoldYellow
        : ParticleEffect.NoteCircularHoldGreen
    const linearEffect = isCritical
        ? ParticleEffect.NoteLinearHoldYellow
        : ParticleEffect.NoteLinearHoldGreen

    const spawnTime = EntityMemory.to<number>(0)
    const visibleTime = EntityMemory.to<number>(1)

    const headL = EntityMemory.to<number>(2)
    const headR = EntityMemory.to<number>(3)
    const tailL = EntityMemory.to<number>(4)
    const tailR = EntityMemory.to<number>(5)

    const headLayout = getNoteLayout(EntityMemory.to(6))
    const tailLayout = getNoteLayout(EntityMemory.to(14))

    const headHitboxL = EntityMemory.to<number>(22)
    const headHitboxR = EntityMemory.to<number>(23)
    const tailHitboxL = EntityMemory.to<number>(24)
    const tailHitboxR = EntityMemory.to<number>(25)

    const connectorZ = EntityMemory.to<number>(26)
    const slideZ = EntityMemory.to<number>(27)

    const circularId = EntityMemory.to<number>(28)
    const linearId = EntityMemory.to<number>(29)
    const holdId = EntityMemory.to<number>(30)

    const previousPressState = EntityMemory.to<boolean>(31)
    const holdCount = isCritical ? criticalHoldSFXCount : holdSFXCount
    const postProcessDone = EntityMemory.to<boolean>(32)

    const preprocess = [
        applyLevelSpeed(
            ConnectorData.headTime,
            ConnectorData.tailTime,
            ConnectorData.headHispeedTime,
            ConnectorData.tailHispeedTime
        ),
        applyMirrorCenters(ConnectorData.headCenter, ConnectorData.tailCenter),

        spawnTime.set(getSpawnTime(ConnectorData.headTime)),
        visibleTime.set(getVisibleTime(ConnectorData.headTime)),

        headL.set(Multiply(Subtract(ConnectorData.headCenter, ConnectorData.headWidth), lane.w)),
        headR.set(Multiply(Add(ConnectorData.headCenter, ConnectorData.headWidth), lane.w)),
        tailL.set(Multiply(Subtract(ConnectorData.tailCenter, ConnectorData.tailWidth), lane.w)),
        tailR.set(Multiply(Add(ConnectorData.tailCenter, ConnectorData.tailWidth), lane.w)),

        calculateNoteLayout(ConnectorData.headCenter, ConnectorData.headWidth, headLayout),
        calculateNoteLayout(ConnectorData.tailCenter, ConnectorData.tailWidth, tailLayout),

        calculateHitbox(
            ConnectorData.headCenter,
            ConnectorData.headWidth,
            leniency,
            headHitboxL,
            headHitboxR
        ),
        calculateHitbox(
            ConnectorData.tailCenter,
            ConnectorData.tailWidth,
            leniency,
            tailHitboxL,
            tailHitboxR
        ),

        connectorZ.set(getZ(Layer.NoteConnector, ConnectorData.headTime, ConnectorData.headIndex)),
        slideZ.set(getZ(Layer.NoteSlide, ConnectorData.headTime, ConnectorData.headIndex)),
    ]

    const spawnOrder = spawnTime

    const shouldSpawn = Or(levelHasHispeed, GreaterOr(Time, spawnTime))

    const noteScale = EntityMemory.to<number>(33)

    const touch = Or(
        options.isAutoplay,
        And(
            GreaterOr(Time, ConnectorData.headTime),
            NotEqual(ConnectorData.headSharedMemory.slideTime, Time),
            checkTouchYInHitbox(),
            checkTouchXInHitbox(
                ConnectorData.headSharedMemory.slideHitboxL,
                ConnectorData.headSharedMemory.slideHitboxR
            ),
            [
                disallowEmpties.add(TouchId),
                rotateAngle.set(Add(rotateAngle.get(), TouchX)),
                ConnectorData.headSharedMemory.slideTime.set(Time),
            ]
        )
    )

    const vhTime = EntityMemory.to<number>(33)
    const vtTime = EntityMemory.to<number>(34)

    const shTime = EntityMemory.to<number>(35)
    const stTime = EntityMemory.to<number>(36)
    const shXScale = EntityMemory.to<number>(37)
    const stXScale = EntityMemory.to<number>(38)
    const shYScale = EntityMemory.to<number>(39)
    const stYScale = EntityMemory.to<number>(40)

    const connectorBottom = EntityMemory.to<number>(41)
    const connectorTop = EntityMemory.to<number>(42)

    const center = EntityMemory.to<number>(43)

    const isZeroWidth = LessOr(
        Abs(
            Subtract(
                Lerp(headLayout[2], tailLayout[2], noteScale),
                Lerp(headLayout[3], tailLayout[3], noteScale)
            )
        ),
        0
    )
    const alpha = EntityMemory.to<number>(44)

    const hiddenTime = Add(Time, Multiply(options.hidden, noteOnScreenDuration))

    const shouldPlaySFX = And(
        Or(
            options.isAutoplay,
            options.lockSlide,
            Equal(ConnectorData.headInfo.state, State.Spawned),
            LessOr(Subtract(Time, ConnectorData.headSharedMemory.slideTime), Add(DeltaTime, 0.01)),
            Less(Time, ConnectorData.headSharedMemory.slideTime)
        ),
        Not(isZeroWidth)
    )
    const updateSequential = [
        And(GreaterOr(Time, ConnectorData.headTime), [
            If(
                options.isAutoplay,
                rotateAngle.set(
                    Add(
                        rotateAngle.get(),
                        Divide(
                            Add(
                                Lerp(headHitboxL, tailHitboxL, noteScale),
                                Lerp(headHitboxR, tailHitboxR, noteScale)
                            ),
                            2
                        )
                    )
                ),
                [
                    noteScale.set(
                        ease(Unlerp(ConnectorData.headTime, ConnectorData.tailTime, Time))
                    ),
                    ConnectorData.headSharedMemory.slideHitboxL.set(
                        Lerp(headHitboxL, tailHitboxL, noteScale)
                    ),
                    ConnectorData.headSharedMemory.slideHitboxR.set(
                        Lerp(headHitboxR, tailHitboxR, noteScale)
                    ),
                ]
            ),

            And(
                options.isSFXEnabled,
                If(
                    previousPressState.get(),

                    Or(shouldPlaySFX, [
                        previousPressState.set(false),
                        holdCount.set(Subtract(holdCount.get(), 1)),
                    ]),

                    And(shouldPlaySFX, [
                        previousPressState.set(true),
                        holdCount.set(Add(holdCount.get(), 1)),
                    ])
                )
            ),
        ]),
        // DebugLog(
        //     Subtract(
        //         (Subtract(ConnectorData.headSharedMemory.slideTime, Time), Add(DeltaTime, 0.01))
        //     )
        // ),

        And(GreaterOr(Time, ConnectorData.tailTime), [
            And(
                shouldPlaySFX,
                Not(postProcessDone.get()),
                holdCount.set(Subtract(holdCount.get(), 1))
            ),
            postProcessDone.set(true),
            1,
        ]),
    ]

    const updateParallel = [
        bool(
            Or(
                GreaterOr(Time, ConnectorData.tailTime),
                And(Or(GreaterOr(Time, visibleTime), levelHasHispeed), [
                    vhTime.set(
                        If(
                            GreaterOr(Time, ConnectorData.headTime),

                            Max(
                                ConnectorData.headHispeedTime,
                                calculateHispeedTime(ConnectorData.headHispeedGroup)
                            ),
                            ConnectorData.headHispeedTime
                        )
                    ),
                    vtTime.set(
                        Min(
                            ConnectorData.tailHispeedTime,
                            Add(
                                calculateHispeedTime(ConnectorData.headHispeedGroup),

                                noteOnScreenDuration
                            )
                        )
                    ),

                    And(Greater(options.hidden, 0), [
                        vhTime.set(Max(vhTime, hiddenTime)),
                        vtTime.set(Max(vtTime, hiddenTime)),
                    ]),

                    alpha.set(
                        Multiply(
                            options.connectorAlpha,
                            If(
                                Or(
                                    options.isAutoplay,
                                    options.lockSlide,
                                    Equal(ConnectorData.headInfo.state, State.Spawned),
                                    Equal(ConnectorData.headSharedMemory.slideTime, Time),
                                    Less(
                                        Subtract(Time, ConnectorData.headSharedMemory.startTime),
                                        InputOffset
                                    )
                                ),
                                1,
                                0.5
                            )
                        )
                    ),

                    And(
                        Greater(approach(vhTime, ConnectorData.headHispeedGroup), noteFirstAppearY),
                        [...Array(10).keys()].map((i) => [
                            shTime.set(Lerp(vhTime, vtTime, i / 10)),
                            stTime.set(Lerp(vhTime, vtTime, (i + 1) / 10)),

                            shXScale.set(
                                ease(
                                    Unlerp(
                                        ConnectorData.headHispeedTime,
                                        ConnectorData.tailHispeedTime,
                                        shTime
                                    )
                                )
                            ),
                            stXScale.set(
                                ease(
                                    Unlerp(
                                        ConnectorData.headHispeedTime,
                                        ConnectorData.tailHispeedTime,
                                        stTime
                                    )
                                )
                            ),
                            If(
                                levelHasHispeed,
                                [
                                    shYScale.set(
                                        Lerp(
                                            approach(shTime, ConnectorData.headHispeedGroup),
                                            approach(shTime, ConnectorData.tailHispeedGroup),
                                            shXScale
                                        )
                                    ),
                                    stYScale.set(
                                        Lerp(
                                            approach(stTime, ConnectorData.headHispeedGroup),
                                            approach(stTime, ConnectorData.tailHispeedGroup),
                                            stXScale
                                        )
                                    ),
                                ],
                                [shYScale.set(approach(shTime)), stYScale.set(approach(stTime))]
                            ),

                            connectorBottom.set(Lerp(origin, lane.b, shYScale)),
                            connectorTop.set(Lerp(origin, lane.b, stYScale)),

                            (
                                [
                                    [connectionSprite, 1],
                                    [
                                        connectionActiveSprite,
                                        Subtract(
                                            1,
                                            udLoop(
                                                Multiply(
                                                    4,
                                                    Subtract(
                                                        Time,
                                                        ConnectorData.headSharedMemory.startTime
                                                    )
                                                )
                                            )
                                        ),
                                        And(
                                            Not(options.lockSlide),
                                            Or(
                                                options.isAutoplay,
                                                Equal(ConnectorData.headInfo.state, State.Spawned),
                                                Equal(
                                                    ConnectorData.headSharedMemory.slideTime,
                                                    Time
                                                ),
                                                Less(
                                                    Subtract(
                                                        Time,
                                                        ConnectorData.headSharedMemory.startTime
                                                    ),
                                                    InputOffset
                                                )
                                            ),
                                            Not(Equal(ConnectorData.headInfo.state, State.Spawned)),
                                            Not(isZeroWidth)
                                        ),
                                    ],
                                ] as const
                            ).map(([sprite, alphaMul, cond], i) => {
                                const draw = Draw(
                                    sprite,
                                    Multiply(Lerp(headL, tailL, shXScale), shYScale),
                                    connectorBottom,
                                    Multiply(Lerp(headL, tailL, stXScale), stYScale),
                                    connectorTop,
                                    Multiply(Lerp(headR, tailR, stXScale), stYScale),
                                    connectorTop,
                                    Multiply(Lerp(headR, tailR, shXScale), shYScale),
                                    connectorBottom,
                                    Add(connectorZ, i * 2),
                                    Multiply(alpha, alphaMul)
                                )
                                return Or(options.hideNotes, cond ? And(cond, draw) : draw)
                            }),
                        ])
                    ),

                    And(GreaterOr(Time, ConnectorData.headTime), [
                        noteScale.set(
                            ease(
                                Unlerp(
                                    ConnectorData.headHispeedTime,
                                    ConnectorData.tailHispeedTime,
                                    calculateHispeedTime(ConnectorData.headHispeedGroup)
                                )
                            )
                        ),

                        And(
                            LessOr(options.hidden, 0),
                            noteSprite.draw(
                                1,
                                baseNote.b,
                                baseNote.t,
                                [
                                    Lerp(headLayout[0], tailLayout[0], noteScale),
                                    Lerp(headLayout[1], tailLayout[1], noteScale),
                                    Lerp(headLayout[2], tailLayout[2], noteScale),
                                    Lerp(headLayout[3], tailLayout[3], noteScale),
                                    Lerp(headLayout[4], tailLayout[4], noteScale),
                                    Lerp(headLayout[5], tailLayout[5], noteScale),
                                    Lerp(headLayout[6], tailLayout[6], noteScale),
                                    Lerp(headLayout[7], tailLayout[7], noteScale),
                                ],
                                slideZ
                            )
                        ),

                        Or(isZeroWidth, [
                            And(
                                options.isNoteEffectEnabled,
                                Or(
                                    HasParticleEffect(circularEffect),
                                    HasParticleEffect(linearEffect)
                                ),
                                center.set(
                                    Lerp(
                                        ConnectorData.headCenter,
                                        ConnectorData.tailCenter,
                                        noteScale
                                    )
                                )
                            ),

                            And(
                                options.isNoteEffectEnabled,
                                HasParticleEffect(circularEffect),
                                If(
                                    Or(
                                        options.isAutoplay,
                                        Equal(ConnectorData.headSharedMemory.slideTime, Time)
                                    ),
                                    [
                                        Or(
                                            bool(circularId),
                                            circularId.set(
                                                SpawnParticleEffect(
                                                    circularEffect,
                                                    ...rectByEdge(0, 0, 0, 0),
                                                    1,
                                                    true
                                                )
                                            )
                                        ),

                                        MoveParticleEffect(
                                            circularId,
                                            Subtract(
                                                Multiply(center, circularHoldEffect.bw),
                                                circularHoldEffect.w
                                            ),
                                            circularHoldEffect.b,
                                            Subtract(
                                                Multiply(center, circularHoldEffect.tw),
                                                circularHoldEffect.w
                                            ),
                                            circularHoldEffect.t,
                                            Add(
                                                Multiply(center, circularHoldEffect.tw),
                                                circularHoldEffect.w
                                            ),
                                            circularHoldEffect.t,
                                            Add(
                                                Multiply(center, circularHoldEffect.bw),
                                                circularHoldEffect.w
                                            ),
                                            circularHoldEffect.b
                                        ),
                                    ],
                                    And(bool(circularId), [
                                        DestroyParticleEffect(circularId),
                                        circularId.set(0),
                                    ])
                                )
                            ),

                            And(
                                options.isNoteEffectEnabled,
                                HasParticleEffect(linearEffect),
                                If(
                                    Or(
                                        options.isAutoplay,
                                        Equal(ConnectorData.headSharedMemory.slideTime, Time)
                                    ),
                                    [
                                        Or(
                                            bool(linearId),
                                            linearId.set(
                                                SpawnParticleEffect(
                                                    linearEffect,
                                                    ...rectByEdge(0, 0, 0, 0),
                                                    1,
                                                    true
                                                )
                                            )
                                        ),

                                        MoveParticleEffect(
                                            linearId,
                                            Subtract(Multiply(center, lane.w), linearHoldEffect.w),
                                            lane.b,
                                            Subtract(
                                                Multiply(center, linearHoldEffect.tw),
                                                linearHoldEffect.w
                                            ),
                                            linearHoldEffect.t,
                                            Add(
                                                Multiply(center, linearHoldEffect.tw),
                                                linearHoldEffect.w
                                            ),
                                            linearHoldEffect.t,
                                            Add(Multiply(center, lane.w), linearHoldEffect.w),
                                            lane.b
                                        ),
                                    ],
                                    And(bool(linearId), [
                                        DestroyParticleEffect(linearId),
                                        linearId.set(0),
                                    ])
                                )
                            ),
                        ]),
                    ]),
                ])
            )
        ),
        0,
    ]

    const terminate = [
        And(bool(circularId), DestroyParticleEffect(circularId)),
        And(bool(linearId), DestroyParticleEffect(linearId)),
        And(bool(holdId), StopLooped(holdId)),
    ]

    return {
        preprocess,
        spawnOrder,
        shouldSpawn,
        updateSequential,
        touch,
        updateParallel,
        terminate,
    }
}

function ease(progress: Code<number>) {
    return SwitchInteger(
        ConnectorData.easeType,
        [Power(progress, 2), Subtract(1, Power(Subtract(1, progress), 2))],
        progress
    )
}
