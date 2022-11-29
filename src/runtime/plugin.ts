import type { Plugin } from 'vite'
import { init, parse } from 'es-module-lexer'

export function transformRemoteFunctions (): Plugin {
  return {
    name: 'vite-plugin-remote-functions',
    enforce: 'post',
    async transform (code, id, opts) {
      if (opts?.ssr) {
        return
      }

      if (!id.includes('.server.') && !id.includes('.remote.')) {
        return
      }

      const result = await transformExports(code)

      return {
        code: result
      }
    }
  }
}

async function transformExports (src: string) {
  await init

  const [, exports] = parse(src)

  return exports.map((e) => {
    if (e.n === 'default') {
      throw new Error('Default exports are not allowed!')
    }

    return `export const ${e.n} = (...args) => useServerFunctions().${e.n}(...args)`
  }).join('\n')
}
