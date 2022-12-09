import { EffectClip } from 'sonolus-core'
import {
    Add,
    And,
    Code,
    HasEffectClip,
    If,
    InputJudgment,
    LevelMemory,
    Not,
    Play,
} from 'sonolus.js'
import { options } from '../../../configuration/options'
import {
    criticalFlickClip,
    criticalHoldClip,
    criticalTapClip,
    criticalTickClip,
    criticalTraceClip,
    minSFXDistance,
    tickClip,
    traceClip,
    traceFlickClip,
} from './constants'

export const holdSFXCount = LevelMemory.to<number>(128)
export const criticalHoldSFXCount = LevelMemory.to<number>(129)

export const getTapClip = (isCritical: boolean, judgment: Code<number> = 1) =>
    getClipIfCritical(isCritical, criticalTapClip, Add(EffectClip.Miss, judgment))

export const getTickClip = (isCritical: boolean, judgment: Code<number> = 1) =>
    getClipIfCritical(
        isCritical,
        criticalTickClip,
        getClip(tickClip, Add(EffectClip.Miss, judgment))
    )

export const getFlickClip = (isCritical: boolean, judgment: Code<number> = 1) =>
    getClipIfCritical(isCritical, criticalFlickClip, Add(EffectClip.MissAlternative, judgment))

export const getHoldClip = (isCritical: boolean) =>
    getClipIfCritical(isCritical, criticalHoldClip, EffectClip.Hold)

export const getTraceClip = (isCritical: boolean) =>
    getClipIfCritical(isCritical, criticalTraceClip, traceClip)

export const getTraceFlickClip = (isCritical: boolean) =>
    getClipIfCritical(isCritical, criticalTraceClip, traceFlickClip)

export const playJudgmentSFX = (
    isCritical: boolean,
    getClip: (isCritical: boolean, judgment: Code<number>) => Code<number>
) =>
    And(
        options.isSFXEnabled,
        Not(options.isAutoSFX),
        Play(getClip(isCritical, InputJudgment), minSFXDistance)
    )

const getClipIfCritical = (isCritical: boolean, criticalId: Code<number>, id: Code<number>) =>
    isCritical ? getClip(criticalId, id) : id

const getClip = (id: Code<number>, fallback: Code<number>) => If(HasEffectClip(id), id, fallback)
