import {
    createScaledTimeToEarliestTime,
    createTimeToScaledTime,
} from '~shared/engine/data/timeScale.mjs'
import { archetypes } from './index.mjs'

export const scaledTimeToEarliestTime = createScaledTimeToEarliestTime(archetypes, bpmChanges)
export const timeToScaledTime = createTimeToScaledTime(archetypes, bpmChanges)
