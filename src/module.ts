import { fileURLToPath } from 'url'
import { addImportsDir, addServerHandler, addTemplate, addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import fg from 'fast-glob'
import { join } from 'pathe'
import dedent from 'dedent'
import { getModuleId, transformServerFiles } from './runtime/transformer'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-remote-fn',
    configKey: 'remote'
  },
  async setup (_, nuxt) {
    const extGlob = '**/*.server.{ts,js,mjs}'

    const files: string[] = []

    nuxt.hook('builder:watch', async (e, path) => {
      if (e === 'change') { return }
      if (path.includes('.server.')) {
        await scanRemoteFunctions()
        await nuxt.callHook('builder:generateApp')
      }
    })

    // Transpile runtime and handler
    const handlerPath = join(nuxt.options.buildDir, 'remote-event-handler.ts')
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir, handlerPath)

    addServerHandler({
      route: '/api/__remote/:path',
      handler: handlerPath
    })

    addVitePlugin(transformServerFiles())
    addImportsDir(join(runtimeDir, 'composables'))

    await scanRemoteFunctions()

    addTemplate({
      filename: 'remote-event-handler.ts',
      write: true,
      getContents () {
        const filesWithId = files.map(file => ({
          file: file.replace(/\.ts$/, ''),
          id: getModuleId(file)
        }))
        return dedent`
          import { createRemoteFnHandler } from '${join(runtimeDir, 'server')}'
          ${filesWithId.map(i => `import * as ${i.id} from '${i.file}'`).join('\n')}
          export default createRemoteFnHandler({
            ${filesWithId.map(i => i.id).join(',\n')}
          })
        `
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
