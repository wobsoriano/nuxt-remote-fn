import type { Plugin } from 'vite'
import { init, parse } from 'es-module-lexer'
import * as path from 'pathe'

export function getModuleId (file: string) {
  const base = path.basename(file, path.extname(file)) // todo.server
  const id = base.split('.').slice(0,-1).join("_") // todo
  const validId = id.replaceAll(/[^\p{L}\p{N}_$]/gu, '_').replace(/^\d/, '_$&')
  return validId
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
