import fs from 'fs/promises'
import { LevelData } from 'sonolus-core'
import { susToUSC } from '~lib/src/sus/convert.cjs'
import { uscToLevelData } from '~lib/src/usc/convert.cjs'
// import chart from './expert.json'

export const data: LevelData = await fs
    .readFile('./src/level/data/lyrith.sus', 'utf-8')
    .then(susToUSC)
    .then(uscToLevelData)
