import { LevelData } from 'sonolus-core'
// import { chsToUSC } from '~lib/src/chs/convert.cjs'
// import { uscToLevelData } from '~lib/src/usc/convert.cjs'
import expert from './expert.json'

// export const data: LevelData = await fs
//     .readFile('./play/src/level/data/ched3.chs')
//     .then(chsToUSC)
//     .then(uscToLevelData)
//     .catch((error) => {
//         console.error(error)
//         return expert
//     })

// await fs.writeFile('./play/src/level/data/test.json', JSON.stringify(data, null, 4))
export const data: LevelData = expert
