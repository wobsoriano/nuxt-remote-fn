import { fileURLToPath } from 'url'
import { addImportsDir, addServerHandler, addTemplate, addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import fg from 'fast-glob'
import { join } from 'pathe'
import { transformRemoteFunctions } from './runtime/plugin'

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
      route: '/api/_remote_fn',
      handler: handlerPath
    })

    addVitePlugin(transformRemoteFunctions())
    addImportsDir(join(runtimeDir, 'composables'))

    await scanRemoteFunctions()

    addTemplate({
      filename: 'remote-event-handler.ts',
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
