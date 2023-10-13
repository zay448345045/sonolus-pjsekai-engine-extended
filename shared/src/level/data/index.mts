import { promises as fs } from 'fs'
import { LevelData } from 'sonolus-core'
import { chsToUSC } from '~lib/src/chs/convert.cjs'
// import { susToUSC } from '~lib/src/sus/convert.cjs'
// import { mmwsToUSC } from '~lib/src/mmws/convert.cjs'
import { uscToLevelData } from '~lib/src/usc/convert.cjs'
import expert from './test.json'

export const data: LevelData = (await fs
    .readFile('./shared/src/level/data/t.chs')
    .then(chsToUSC)
    .then((usc) => {
        fs.writeFile('./shared/src/level/data/test.usc.json', JSON.stringify(usc, null, 4))
        return usc
    })
    .then(uscToLevelData)
    .catch((error) => {
        console.error(error)
        return expert
    })) as LevelData

await fs.writeFile('./shared/src/level/data/test.levelData.json', JSON.stringify(data, null, 4))
// export const data: LevelData = expert
