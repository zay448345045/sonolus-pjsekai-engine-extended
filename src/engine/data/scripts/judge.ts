import {
    Add,
    And,
    Clamp,
    DebugLog,
    Divide,
    Draw,
    EntityInfo,
    Equal,
    Greater,
    If,
    Less,
    Multiply,
    Script,
    State,
    Subtract,
    Time,
} from 'sonolus.js'
import { JudgmentMissSprite, Layer, sekaiStage } from './common/constants'
import { judgeTime, currentJudge } from './common/judge'
import { rectByEdge } from './common/utils'

export function judge(): Script {
    function drawJudgment() {
        //76, 250
        const judgeWidth = Multiply(sekaiStage.h, 0.0875, 250 / 76)
        const judgeHeight = Divide(Multiply(sekaiStage.h, 0.0875), 2)
        const animateDuration = 0.05
        const scale = Multiply(
            Divide(
                Clamp(
                    Subtract(Time, judgeTime.get()),
                    animateDuration / 3,
                    animateDuration
                ),
                animateDuration
            ),
            0.9
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
                [
                    Draw(
                        Add(JudgmentMissSprite, currentJudge.get(), -1),
                        ...rectByEdge(left, right, bottom, top),
                        Layer.Judgement,
                        1
                    ),
                ],
                []
            ),
        ]
    }
    const spawnOrder = -999

    const updateParallel = [drawJudgment()]

    return {
        spawnOrder: {
            code: spawnOrder,
        },
        updateParallel: {
            code: updateParallel,
        },
    }
}
