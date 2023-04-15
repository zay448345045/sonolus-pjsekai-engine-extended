import { execSync } from 'child_process'
import { build } from 'esbuild'
import esbuildNodeExternalsPlugin from 'esbuild-node-externals'
import { copySync, emptyDirSync, outputFileSync, outputJsonSync, rmSync } from 'fs-extra'
import { buildOutput } from '.'
import { archetypes } from './engine/data/archetypes'

const distPath = './dist'

emptyDirSync(distPath)
copySync('./src/res', distPath)

outputFileSync(`${distPath}/EngineConfiguration`, buildOutput.engine.configuration.buffer)

outputFileSync(`${distPath}/EngineData`, buildOutput.engine.data.buffer)

outputJsonSync(
    `${distPath}/archetypes.json`,
    Object.fromEntries(Object.entries(archetypes).filter(([key]) => key.endsWith('Index')))
)

build({
    entryPoints: ['src/lib/index.ts'],
    bundle: true,
    minify: true,
    outdir: distPath,
    platform: 'node',
    treeShaking: true,
    plugins: [
        esbuildNodeExternalsPlugin(),
        {
            name: 'TypeScriptDeclarationsPlugin',
            setup(build) {
                build.onEnd((result) => {
                    if (result.errors.length > 0) return
                    execSync('tsc --declaration --emitDeclarationOnly --outDir dist', {
                        cwd: distPath,
                        stdio: 'inherit',
                    })
                    copySync(`${distPath}/dist/lib/index.d.ts`, `${distPath}/index.d.ts`)
                    rmSync(`${distPath}/dist`, { recursive: true })
                })
            },
        },
    ],
})
