import fs from 'fs/promises'
import { LevelData } from 'sonolus-core'
import { susToUSC } from '~lib/src/sus/convert.cjs'
import { uscToLevelData } from '~lib/src/usc/convert.cjs'
import expert from './expert.json'

export const data: LevelData = await fs
    .readFile('/tmp/sus.sus', 'utf-8')
    .then(susToUSC)
    .then(uscToLevelData)
    .catch((error) => {
        console.error(error)
        return expert
    })

await fs.writeFile('./src/level/data/test.json', JSON.stringify(data, null, 4))
