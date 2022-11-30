import type { Plugin } from 'vite'
import { init, parse } from 'es-module-lexer'

export function getModuleId (file: string) {
  const lastItem = file.split('/')[file.split('/').length - 1] // todo.server.ts
  const id = lastItem.split('.')[0] // todo
  return id
}

export function transformServerFiles (): Plugin {
  return {
    name: 'vite-plugin-remote-functions',
    enforce: 'post',
    async transform (code, id, opts) {
      if (opts?.ssr) {
        return
      }

      if (!id.includes('.server.')) {
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
      return `export default (...args) => callRemoteFunction('${moduleId}.${e.n}', args)`
    }

    return `export const ${e.n} = (...args) => callRemoteFunction('${moduleId}.${e.n}', args)`
  })

  return `
    import { callRemoteFunction } from 'nuxt-remote-fn/client'
    ${exportList.join('\n')}
  `
}
