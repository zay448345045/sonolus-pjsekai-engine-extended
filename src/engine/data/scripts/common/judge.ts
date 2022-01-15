import { Add, InputJudgment, LevelMemory, Time } from 'sonolus.js'
// import { options } from '../../../configuration/options'
// import { minSFXDistance } from './constants'

export const currentJudge = LevelMemory.to<number>(50)
export const judgeTime = LevelMemory.to<number>(51)

export function setJudgeVariable() {
    return [currentJudge.set(Add(InputJudgment, 1)), judgeTime.set(Time)]
}
export function setAutoJudge() {
    return [judgeTime.set(Time)]
}
export const onMiss = [setMissJudge()]
export function setMissJudge() {
    return [currentJudge.set(1), judgeTime.set(Time)]
}
