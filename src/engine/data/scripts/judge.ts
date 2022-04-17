import {
    Add,
    And,
    Clamp,
    customSkinSprite,
    Divide,
    Draw,
    Greater,
    If,
    Less,
    Multiply,
    Script,
    Sin,
    Subtract,
    Time,
} from 'sonolus.js'
import { options } from '../../configuration/options'
import {
    engineId,
    JudgmentMissSprite,
    Layer,
    sekaiStage,
} from './common/constants'
import { judgeTime, currentJudge } from './common/judge'
import { rectByEdge } from './common/utils'

export function judge(): Script {
    function drawJudgment() {
        //76, 250
        const judgeWidth = Multiply(sekaiStage.h, 0.0875, 250 / 76)
        const judgeHeight = Divide(Multiply(sekaiStage.h, 0.0875), 2)
        const animateDuration = 0.05
        const startSize = 0.7
        const scale = Multiply(
            Add(
                startSize,
                Multiply(
                    Divide(
                        Clamp(
                            Subtract(Time, judgeTime.get()),
                            0,
                            animateDuration
                        ),
                        animateDuration
                    ),
                    1 - startSize
                )
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
            Multiply(sekaiStage.h, -0.145),
            Subtract(judgeHeight, Multiply(judgeHeight, scale))
        )
        const top = Add(
            Multiply(sekaiStage.h, -0.145),
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
                    Less(Subtract(Time, judgeTime.get()), 0.3)
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

    function drawAutolive() {
        const height = Multiply(sekaiStage.h, 25 / 588)
        const width = Multiply(height, 321 / 64)
        const padding = Multiply(width, 0.1)
        return [
            If(
                And(options.isAutoplay, options.isAutoJudgmentEnabled),
                [
                    Draw(
                        customSkinSprite(engineId, 7),
                        ...rectByEdge(
                            Subtract(sekaiStage.r, width, Multiply(width, 0.5)),
                            Subtract(sekaiStage.r, Multiply(width, 0.5)),
                            Add(-1, padding),
                            // sekaiStage.t
                            Add(-1, height, padding)
                        ),
                        Layer.Judgement,
                        Sin(Multiply(Time, 3.14))
                    ),
                ],
                []
            ),
        ]
    }
    const spawnOrder = -999
    const updateParallel = [drawJudgment(), drawAutolive()]

    return {
        spawnOrder: {
            code: spawnOrder,
        },
        updateParallel: {
            code: updateParallel,
        },
    }
}
