import { error, log } from 'node:console'
import { copyFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { hash } from 'sonolus-core'

/** @type import('sonolus.js').SonolusCLIConfig */
export default {
    entry: './src/index.mts',
    devServer(sonolus) {
        try {
            copyFileSync('./src/level/bgm.mp3', './.dev/bgm.mp3')

            const level = sonolus.db.levels[0]
            level.bgm = {
                type: 'LevelBgm',
                hash: hash(readFileSync('./.dev/bgm.mp3')),
                url: '/bgm.mp3',
            }
        } catch (_) {
            error('Error: failed to setup bgm, using fallback')
            log()
        }
    },
    async esbuild(options) {
        return {
            ...options,
            plugins: [
                {
                    name: 'ts-paths',
                    setup(build) {
                        build.onResolve(
                            {
                                filter: /^~(lib)?\/.*/,
                            },
                            async (args) => {
                                const path = args.path.startsWith('~lib/')
                                    ? './lib/' + args.path.slice(5).replace('.cjs', '.cts')
                                    : './src/' + args.path.slice(2).replace('.mjs', '.mts')

                                return {
                                    path: resolve(process.cwd(), path),
                                }
                            },
                        )
                    },
                },
                ...options.plugins,
            ],
        }
    },
}
