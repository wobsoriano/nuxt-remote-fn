import type { Plugin } from 'vite'
import { init, parse } from 'es-module-lexer'

export function getModuleId (file: string) {
  const lastItem = file.split('/')[file.split('/').length - 1] // todo.server.ts
  const id = lastItem.split('.')[0] // todo
  return id
}

interface Options {
  filter: (id: unknown) => boolean
}

export function transformServerFiles (options: Options): Plugin {
  return {
    name: 'vite-plugin-remote-functions',
    enforce: 'post',
    async transform (code, id, opts) {
      if (opts?.ssr) {
        return
      }

      if (!options.filter(id)) {
        return
      }

      const moduleId = getModuleId(id)
      const result = await transformExportsToRemoteFunctions(code, moduleId)

      return {
        code: result
      }
    }
  }
}

async function transformExportsToRemoteFunctions (src: string, moduleId: string) {
  await init

  const [, exports] = parse(src)

  const exportList = exports.map((e) => {
    if (e.n === 'default') {
      return `export default (...args) => client.${moduleId}.${e.n}(...args)`
    }

    return `export const ${e.n} = (...args) => client.${moduleId}.${e.n}(...args)`
  })

  return `
    import { createClient } from '#imports'
    const client = createClient()
    
    ${exportList.join('\n')}
  `
}
