import react from '@vitejs/plugin-react'
import katex from 'katex'
import { Instance } from 'prool'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { vocs } from 'vocs/vite'
import { moderatoZoneRpcUrls } from './src/lib/private-zones.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of Object.keys(env)) {
    if (!(key in process.env)) process.env[key] = env[key]
  }

  const isE2E = process.env.VITE_E2E === 'true' || env.VITE_E2E === 'true'
  const useHttp = process.env.CI === 'true' || process.env.VITE_USE_HTTP === 'true'
  const e2eZoneProxy = isE2E ? getE2EZoneProxy() : undefined

  return {
    plugins: [markdownLatex(), vocs(), react(), ...(useHttp ? [] : [mkcert()]), tempoNode()],
    server: useHttp
      ? {
          host: 'localhost',
          proxy: e2eZoneProxy,
        }
      : undefined,
  }
})

function markdownLatex(): Plugin {
  return {
    name: 'markdown-latex',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.(md|mdx)(?:$|\?)/.test(id)) return
      if (!code.includes('$')) return

      return renderLatex(code)
    },
  }
}

function renderLatex(markdown: string) {
  const lines = markdown.split('\n')
  let inFence = false
  let inDisplayMath = false
  let displayMath = ''
  const out: string[] = []

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      out.push(line)
      continue
    }

    if (inFence) {
      out.push(line)
      continue
    }

    if (inDisplayMath) {
      if (line.trim() === '$$') {
        out.push(renderKatex(displayMath, true))
        inDisplayMath = false
        displayMath = ''
      } else {
        displayMath += `${line}\n`
      }
      continue
    }

    if (line.trim() === '$$') {
      inDisplayMath = true
      continue
    }

    out.push(renderInlineLatex(line))
  }

  if (inDisplayMath) {
    out.push('$$')
    out.push(displayMath.trimEnd())
  }

  return out.join('\n')
}

function renderInlineLatex(line: string) {
  let result = ''
  let i = 0
  let inCode = false

  while (i < line.length) {
    const char = line[i]
    if (char === '`') {
      inCode = !inCode
      result += char
      i += 1
      continue
    }
    if (char !== '$' || inCode || line[i - 1] === '\\') {
      result += char
      i += 1
      continue
    }

    const end = findInlineMathEnd(line, i + 1)
    if (end === -1) {
      result += char
      i += 1
      continue
    }

    result += renderKatex(line.slice(i + 1, end), false)
    i = end + 1
  }

  return result
}

function findInlineMathEnd(line: string, start: number) {
  for (let i = start; i < line.length; i++) {
    if (line[i] === '$' && line[i - 1] !== '\\') return i
  }
  return -1
}

function renderKatex(source: string, displayMode: boolean) {
  const html = katex.renderToString(source.trim(), {
    displayMode,
    strict: 'warn',
    throwOnError: false,
  })
  const tag = displayMode ? 'div' : 'span'
  return `<${tag} dangerouslySetInnerHTML={{__html:${JSON.stringify(html)}}} />`
}

function getE2EZoneProxy() {
  return Object.fromEntries(
    Object.entries(moderatoZoneRpcUrls).map(([zoneId, rpcUrl]) => {
      const parsedUrl = new URL(rpcUrl)
      const authorization = `Basic ${Buffer.from(
        `${decodeURIComponent(parsedUrl.username)}:${decodeURIComponent(parsedUrl.password)}`,
      ).toString('base64')}`
      parsedUrl.username = ''
      parsedUrl.password = ''

      return [
        `/__e2e_zone_rpc/${zoneId}`,
        {
          changeOrigin: true,
          headers: { authorization },
          rewrite: () => '/',
          secure: true,
          target: parsedUrl.toString(),
        },
      ]
    }),
  )
}

function tempoNode(): Plugin {
  return {
    name: 'tempo-node',
    async configureServer(_server) {
      if (!('VITE_TEMPO_ENV' in process.env) || process.env.VITE_TEMPO_ENV !== 'localnet') return
      const instance = Instance.tempo({
        dev: { blockTime: '500ms' },
        port: 8545,
      })
      console.log('→ starting tempo node...')
      await instance.start()
      console.log('√ tempo node started on port 8545')
    },
  }
}
