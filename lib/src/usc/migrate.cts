import { USC } from './index.cjs'

export type VersionedUSC = {
    version: 1
    usc: USC
}

export function migrateUSC(data: VersionedUSC): USC {
    if (data.version === 1) {
        return data.usc
    }
    throw new Error('Unknown version')
}
