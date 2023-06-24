import fs from 'fs/promises'
import { LevelData } from 'sonolus-core'
import { susToUSC } from '~lib/src/sus/convert.cjs'
import { uscToLevelData } from '~lib/src/usc/convert.cjs'

export const data: LevelData = await fs
    .readFile('./src/level/data/ieo.sus', 'utf-8')
    .then(susToUSC)
    .then(uscToLevelData)

await fs.writeFile('./src/level/data/test.json', JSON.stringify(data, null, 4))
