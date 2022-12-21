import { fileURLToPath } from 'node:url'
import { join } from 'pathe'
import { addImports, addServerHandler, addTemplate, addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import fg from 'fast-glob'
import dedent from 'dedent'
import { createFilter } from '@rollup/pluginutils'
import { getModuleId, transformServerFiles } from './runtime/transformer'

export interface ModuleOptions {
  pattern?: string | string[]
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-remote-fn',
    configKey: 'remoteFn'
  },
  defaults: {
    pattern: '**/*.server.{ts,js,mjs}'
  },
  async setup (options, nuxt) {
    const files: string[] = []

    const filter = createFilter(options.pattern)

    // Transpile runtime and handler
    const handlerPath = join(nuxt.options.buildDir, 'remote-handler.ts')
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir, handlerPath)

    nuxt.hook('builder:watch', async (e, path) => {
      if (e === 'change') return
      if (filter(path)) {
        await scanRemoteFunctions()
        await nuxt.callHook('builder:generateApp')
      }
    })

    addServerHandler({
      route: '/api/__remote/:moduleId/:functionName',
      method: 'post',
      handler: handlerPath
    })

    addVitePlugin(transformServerFiles({ filter }))

    addImports([
      {
        name: 'createClient',
        as: 'createClient',
        from: join(runtimeDir, 'client')
      },
    ])

    await scanRemoteFunctions()

    addTemplate({
      filename: 'remote-handler.ts',
      write: true,
      getContents () {
        const filesWithId = files.map(file => ({
          file: file.replace(/\.ts$/, ''),
          id: getModuleId(file)
        }))
        return dedent`
          import { createRemoteFnHandler } from ${JSON.stringify(join(runtimeDir, 'server'))}
          ${filesWithId.map(i => `import * as ${i.id} from ${JSON.stringify(i.file)}`).join('\n')}

          export type RemoteFunction = {
            ${filesWithId.map(i => `${i.id}: typeof ${i.id}`).join('\n')}
          }

          export default createRemoteFnHandler({
            ${filesWithId.map(i => i.id).join(',\n')}
          })
        `
      }
    })

    async function scanRemoteFunctions () {
      files.length = 0
      const updatedFiles = await fg(options.pattern!, {
        cwd: nuxt.options.srcDir,
        absolute: true,
        onlyFiles: true,
        ignore: ['!**/node_modules', '!**/.nuxt', '!**/dist', '!**/.output']
      })
      files.push(...new Set(updatedFiles))
      return files
    }
  }
})
