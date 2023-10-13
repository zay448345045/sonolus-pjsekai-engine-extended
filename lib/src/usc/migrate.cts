import { USC as USC1 } from './types/v1.cjs'
import { USC as USC2 } from './types/v2.cjs'

type USC = USC2

export type VersionedUSC =
    | {
          version: 1
          usc: USC1
      }
    | {
          version: 2
          usc: USC2
      }

function migrateUSC1(data: USC1): USC2 {
    const objects: USC2['objects'] = []
    for (const object of data.objects) {
        if (object.type !== 'slide') {
            objects.push(object)
            continue
        }
        switch (object.subType) {
            case 'normal':
                objects.push({
                    type: 'slide',
                    connections: object.connections,
                    critical: object.critical,
                })
                break
            case 'fadeDummy':
            case 'dummy':
                objects.push({
                    type: 'guide',
                    color: object.critical ? 'yellow' : 'green',
                    fade: object.subType === 'fadeDummy' ? 'out' : 'none',
                    midpoints: object.connections.flatMap((c) => {
                        if (c.type !== 'tick') {
                            return []
                        }

                        return [
                            {
                                lane: c.lane,
                                beat: c.beat,
                                size: c.size,
                                timeScaleGroup: c.timeScaleGroup,
                                ease: c.ease,
                            },
                        ]
                    }),
                })
                break

            default:
                throw new Error('Unknown subType')
        }
    }
    return {
        offset: data.offset,
        objects,
    }
}

export function migrateUSC(data: VersionedUSC): USC {
    let d = JSON.parse(JSON.stringify(data.usc))
    if (data.version === 1) {
        d = migrateUSC1(d)
    }
    if (data.version === 2) {
        return d
    }
    throw new Error('Unknown version')
}
