import type { Plugin } from 'vite'
import { init, parse } from 'es-module-lexer'

export function getModuleId (file: string) {
  const lastItem = file.split('/')[file.split('/').length - 1] // todo.server.ts
  const id = lastItem.split('.')[0] // todo
  return id
}

export function transformRemoteFunctions (): Plugin {
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
      const result = await transformExports(code, moduleId)

      return {
        code: result
      }
    }
  }
}

async function transformExports (src: string, moduleId: string) {
  await init

  const [, exports] = parse(src)

  const exportList = exports.map((e) => {
    if (e.n === 'default') {
      return `export default (...args) => useRemoteFunction('${moduleId}.${e.n}', args)`
    }

    return `export const ${e.n} = (...args) => useRemoteFunction('${moduleId}.${e.n}', args)`
  })

  return `
    import { useRemoteFunction } from '#imports'
    ${exportList.join('\n')}
  `
}
