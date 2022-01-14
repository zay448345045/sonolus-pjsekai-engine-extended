import {
    Add,
    And,
    bool,
    Clamp,
    Code,
    Divide,
    Draw,
    EntityInfo,
    EntityMemory,
    Equal,
    Floor,
    Greater,
    GreaterOr,
    HasSkinSprite,
    If,
    Lerp,
    Less,
    LessOr,
    Multiply,
    Not,
    NotEqual,
    Or,
    Remap,
    Script,
    SkinSprite,
    State,
    Subtract,
    Time,
    TouchDX,
    TouchId,
    TouchStarted,
    TouchX,
    visualize,
} from 'sonolus.js'
import { options } from '../../configuration/options'
import {
    baseNote,
    lane,
    Layer,
    origin,
    screen,
    sekaiStage,
    SekaiStageSprite,
    stage as stageC,
    JudgmentMissSprite,
} from './common/constants'
import { playEmptyLaneEffect } from './common/effect'
import { playStageSFX } from './common/sfx'
import { checkTouchYInHitbox } from './common/touch'
import { rectByEdge } from './common/utils'
import { disallowEmpties } from './input'
import { currentJudge, judgeTime } from './common/judge-renderer'

export function stage(): Script {
    const spawnOrder = -999

    const shouldSpawn = Equal(EntityInfo.of(0).state, State.Despawned)

    const touch = Or(
        options.isAutoplay,
        And(
            Not(disallowEmpties.contains(TouchId)),
            checkTouchYInHitbox(),
            GreaterOr(TouchX, Multiply(lane.w, -6)),
            LessOr(TouchX, Multiply(lane.w, 6)),
            If(TouchStarted, onEmptyTap(), onEmptyMove())
        )
    )

    const updateParallel = [drawStageCover(), drawJudgment(), drawStage()]

    return {
        spawnOrder: {
            code: spawnOrder,
        },
        shouldSpawn: {
            code: shouldSpawn,
        },
        touch: {
            code: touch,
            order: 1,
        },
        updateParallel: {
            code: updateParallel,
        },
    }

    function drawStageCover() {
        const stageCoverBottom = Lerp(lane.t, lane.b, options.stageCover)

        return And(
            bool(options.stageCover),
            Draw(
                SkinSprite.StageCover,
                ...rectByEdge(screen.l, screen.r, stageCoverBottom, screen.t),
                Layer.Cover,
                1
            )
        )
    }

    function drawJudgment() {
        //76, 250
        const judgeWidth = Multiply(sekaiStage.h, 0.0875, 250 / 76)
        const judgeHeight = Divide(Multiply(sekaiStage.h, 0.0875), 2)
        const animateDuration = 0.05
        const scale = Divide(
            Clamp(Subtract(Time, judgeTime.get()), 0.05, animateDuration),
            animateDuration
        )
        const left = Add(
            sekaiStage.l,
            Multiply(sekaiStage.w, 0.5),
            Multiply(Divide(judgeWidth, -2), scale)
        )
        const right = Add(
            sekaiStage.l,
            Multiply(sekaiStage.w, 0.5),
            Multiply(Divide(judgeWidth, 2), scale)
        )
        const bottom = Add(
            Multiply(sekaiStage.h, -0.15),
            Subtract(judgeHeight, Multiply(judgeHeight, scale))
        )
        const top = Add(
            Multiply(sekaiStage.h, -0.15),
            Multiply(sekaiStage.h, 0.0875),
            Multiply(judgeHeight, Subtract(1, scale), -1)
        )
        // return Or(
        //     Equal(currentJudge.get(), -1),
        //     Draw(
        //         Add(JudgmentMissSprite, currentJudge.get()),
        //         ...rectByEdge(left, right, bottom, top),
        //         Layer.Judgement,
        //         1
        //     )
        // )
        return [
            If(
                And(
                    Greater(currentJudge.get(), 0),
                    Less(Subtract(Time, judgeTime.get()), 0.5)
                ),

                Draw(
                    Add(
                        JudgmentMissSprite,
                        If(options.isAutoplay, 2, currentJudge.get()),
                        -1
                    ),
                    ...rectByEdge(left, right, bottom, top),
                    Layer.Judgement,
                    1
                ),
                []
            ),
        ]
    }

    function drawStage() {
        return If(
            HasSkinSprite(SekaiStageSprite),
            Draw(
                SekaiStageSprite,
                ...rectByEdge(
                    sekaiStage.l,
                    sekaiStage.r,
                    sekaiStage.b,
                    sekaiStage.t
                ),
                Layer.Stage,
                1
            ),
            [
                Draw(
                    SkinSprite.JudgmentLine,
                    Multiply(baseNote.bw, -6),
                    baseNote.b,
                    Multiply(baseNote.tw, -6),
                    baseNote.t,
                    Multiply(baseNote.tw, 6),
                    baseNote.t,
                    Multiply(baseNote.bw, 6),
                    baseNote.b,
                    Layer.JudgmentLine,
                    1
                ),
                [...Array(6).keys()]
                    .map((i) => [(i - 3) * 2, (i - 2) * 2])
                    .map(([l, r]) =>
                        Draw(
                            SkinSprite.Lane,
                            Remap(
                                origin,
                                lane.b,
                                0,
                                Multiply(l, lane.w),
                                screen.b
                            ),
                            screen.b,
                            Remap(
                                origin,
                                lane.b,
                                0,
                                Multiply(l, lane.w),
                                stageC.t
                            ),
                            stageC.t,
                            Remap(
                                origin,
                                lane.b,
                                0,
                                Multiply(r, lane.w),
                                stageC.t
                            ),
                            stageC.t,
                            Remap(
                                origin,
                                lane.b,
                                0,
                                Multiply(r, lane.w),
                                screen.b
                            ),
                            screen.b,
                            Layer.Stage,
                            1
                        )
                    ),
                Draw(
                    SkinSprite.StageLeftBorder,
                    Remap(origin, lane.b, 0, Multiply(-6.5, lane.w), screen.b),
                    screen.b,
                    Remap(origin, lane.b, 0, Multiply(-6.5, lane.w), stageC.t),
                    stageC.t,
                    Remap(origin, lane.b, 0, Multiply(-6, lane.w), stageC.t),
                    stageC.t,
                    Remap(origin, lane.b, 0, Multiply(-6, lane.w), screen.b),
                    screen.b,
                    Layer.Stage,
                    1
                ),
                Draw(
                    SkinSprite.StageRightBorder,
                    Remap(origin, lane.b, 0, Multiply(6, lane.w), screen.b),
                    screen.b,
                    Remap(origin, lane.b, 0, Multiply(6, lane.w), stageC.t),
                    stageC.t,
                    Remap(origin, lane.b, 0, Multiply(6.5, lane.w), stageC.t),
                    stageC.t,
                    Remap(origin, lane.b, 0, Multiply(6.5, lane.w), screen.b),
                    screen.b,
                    Layer.Stage,
                    1
                ),
            ]
        )
    }

    function onEmptyTap() {
        const index = EntityMemory.to<number>(32)

        return [index.set(xToIndex(TouchX)), playEmpty(index)]
    }

    function onEmptyMove() {
        const indexNew = EntityMemory.to<number>(32)
        const indexOld = EntityMemory.to<number>(33)

        return [
            indexNew.set(xToIndex(TouchX)),
            indexOld.set(xToIndex(Subtract(TouchX, TouchDX))),
            And(NotEqual(indexNew, indexOld), playEmpty(indexNew)),
        ]
    }
}

function xToIndex(x: Code<number>) {
    return Floor(Divide(x, lane.w))
}

function playEmpty(index: Code<number>) {
    return [playStageSFX(), playEmptyLaneEffect(index)]
}
