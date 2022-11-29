import { fileURLToPath } from 'url'
import { addImportsDir, addServerHandler, addTemplate, addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import fg from 'fast-glob'
import { join } from 'pathe'
import { transformRemoteFunctions } from '../dist/runtime/plugin'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-remote-functions',
    configKey: 'remote'
  },
  async setup (_, nuxt) {
    const extGlob = '**/*.server.{ts,js}'

    const files: string[] = []

    const handlerPath = join(nuxt.options.buildDir, 'server-fn-handler.ts')

    // Transpile runtime
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    addServerHandler({
      route: '/api/__remote_fn__',
      handler: handlerPath
    })

    addVitePlugin(transformRemoteFunctions())
    addImportsDir(join(runtimeDir, 'composables'))

    await scanRemoteFunctions()

    addTemplate({
      filename: 'server-fn-handler.ts',
      write: true,
      getContents () {
        return `
          import { createRemoteFnHandler } from '${join(runtimeDir, 'server')}'
          ${files.map((i, idx) => `import * as functions${idx} from ${JSON.stringify(i.replace(/\.ts$/, ''))}`).join('\n')}
          export default createRemoteFnHandler(Object.assign({}, ${files.map((_, idx) => `functions${idx}`).join(', ')}))
          `.trimStart()
      }
    })

    async function scanRemoteFunctions () {
      files.length = 0
      const updatedFiles = await fg(extGlob, {
        cwd: nuxt.options.rootDir,
        absolute: true,
        onlyFiles: true,
        ignore: ['!**/node_modules', '!**/.nuxt']
      })
      // @ts-ignore
      files.push(...new Set(updatedFiles))
      return files
    }
  }
})
