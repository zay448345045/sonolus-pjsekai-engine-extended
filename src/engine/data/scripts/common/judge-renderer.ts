import { Add, DebugLog, InputJudgment, LevelMemory, Time } from 'sonolus.js'
// import { options } from '../../../configuration/options'
// import { minSFXDistance } from './constants'

export const currentJudge = LevelMemory.to<number>(128)
export const judgeTime = LevelMemory.to<number>(129)

export function setJudgeVariable() {
    return [currentJudge.set(Add(InputJudgment, 1)), judgeTime.set(Time)]
}
export function setAutoJudge() {
    return [judgeTime.set(Time)]
}
