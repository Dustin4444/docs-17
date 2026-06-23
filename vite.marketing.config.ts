import fs from 'node:fs/promises'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import Icons from 'unplugin-icons/vite'
import { defineConfig, type Plugin } from 'vite'
import { type CategorySlug, categoryBySlug } from './src/marketing/app/blog/_lib/categories'
import { blogPostsPlugin, loadRenderedPosts } from './src/marketing/blogPlugin'
import {
  absoluteUrl,
  blogPostJsonLd,
  blogThumbnailUrl,
  ogImageUrl,
  type PostSeo,
  resolveBaseUrl,
} from './src/marketing/seo'

const siteBaseUrl = resolveBaseUrl()

const staticRouteCopies = [
  'build',
  'build/tempo-transactions',
  'build/tip20-tokens',
  'blog',
  'diagrams',
  'performance',
]

// Per-post metadata for the blog post routes, populated from the rendered
// markdown so each static copy gets the right title/description/OG.
const blogRouteMetadata = new Map<string, { title: string; description: string }>()
const blogRouteOgImage = new Map<string, string>()
// Raw post data per blog route (keyed `blog/<slug>`), used to emit article
// OpenGraph tags and JSON-LD structured data for each post.
const blogPostByRoute = new Map<string, PostSeo>()

function marketingRouteCopies(): Plugin {
  return {
    name: 'tempo-marketing-route-copies',
    async closeBundle() {
      const root = path.resolve(process.cwd(), 'dist/public')
      const rootHtml = path.join(root, 'index.html')
      const nestedHtml = path.join(root, 'src/marketing/index.html')
      const html = await fs.readFile(rootHtml, 'utf-8').catch(async () => {
        const nested = await fs.readFile(nestedHtml, 'utf-8')
        await fs.writeFile(rootHtml, nested)
        return nested
      })
      await fs.writeFile(rootHtml, applyMarketingMetadata(html, '/'))

      // Each route copy is derived from the raw template (not the processed
      // homepage HTML) so the injected canonical/og:url/article tags — which
      // have no placeholder to overwrite — don't accumulate across routes.
      await Promise.all(
        (await marketingRouteCopiesForBuild()).map(async (route) => {
          const routeDir = path.join(root, route)
          await fs.mkdir(routeDir, { recursive: true })
          await fs.writeFile(path.join(routeDir, 'index.html'), applyMarketingMetadata(html, route))
        }),
      )
      await writeBlogThumbnails(root)
    },
  }
}

async function marketingRouteCopiesForBuild() {
  const posts = await loadRenderedPosts()
  blogRouteMetadata.clear()
  blogRouteOgImage.clear()
  blogPostByRoute.clear()
  for (const post of posts) {
    blogRouteMetadata.set(`blog/${post.slug}`, {
      title: post.metaTitle,
      description: post.metaDescription,
    })
    blogRouteOgImage.set(`blog/${post.slug}`, blogThumbnailUrl(siteBaseUrl, post))
    blogPostByRoute.set(`blog/${post.slug}`, {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      date: post.date,
      category: post.category as CategorySlug,
      thumbnail: post.thumbnail,
    })
  }
  return [...staticRouteCopies, ...posts.map((post) => `blog/${post.slug}`)]
}

const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Tempo',
    description:
      'The only blockchain designed for payments. Sub-second transactions, sub-cent fees.',
  },
  build: {
    title: 'Tempo',
    description:
      'Build payment products on Tempo with stablecoins, fast settlement, and predictable fees.',
  },
  'build/tempo-transactions': {
    title: 'Tempo Transactions',
    description: 'Batch, sponsor, schedule, and parallelize payments with Tempo Transactions.',
  },
  'build/tip20-tokens': {
    title: 'TIP-20 Tokens',
    description:
      'Stablecoin-first Tempo Tokens for payments, fees, memos, policies, and liquidity.',
  },
  performance: {
    title: 'Tempo Performance',
    description:
      'Nightly benchmarks on Tempo throughput, block times, execution rates, and uptime.',
  },
  diagrams: {
    title: 'Tempo Diagrams',
    description: 'A playground for Tempo diagrams, product visuals, and house-style SVG exports.',
  },
  blog: {
    title: 'Blog — Tempo Developers',
    description:
      'Engineering deep dives, network upgrades, events, and case studies from the Tempo team.',
  },
}

function titleCaseRoute(route: string) {
  const acronyms: Record<string, string> = { api: 'API', mpp: 'MPP', sdk: 'SDK', sdks: 'SDKs' }
  return route
    .split('/')
    .pop()
    ?.split('-')
    .filter(Boolean)
    .map((word) => acronyms[word] ?? word[0]?.toUpperCase() + word.slice(1))
    .join(' ')
}

function marketingMetadata(route: string) {
  return (
    blogRouteMetadata.get(route) ??
    routeMetadata[route] ?? {
      title: `${titleCaseRoute(route)} ⋅ Tempo`,
      description: 'Build payment products on Tempo with stablecoins and predictable settlement.',
    }
  )
}

function escapeHtmlAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

function canonicalPath(route: string) {
  return route === '/' ? '/' : `/${route}`
}

// Extra <head> tags that have no placeholder in index.html: canonical, og:url,
// and (for blog posts) the article OpenGraph tags plus JSON-LD structured data.
function marketingHeadExtras(route: string, ogImage: string) {
  const canonical = absoluteUrl(siteBaseUrl, canonicalPath(route))
  const tags: string[] = [`<meta property="og:url" content="${escapeHtmlAttribute(canonical)}" />`]
  if (siteBaseUrl) {
    tags.push(`<link rel="canonical" href="${escapeHtmlAttribute(canonical)}" />`)
  }

  const post = blogPostByRoute.get(route)
  if (post) {
    tags.push(
      `<meta property="article:published_time" content="${escapeHtmlAttribute(post.date)}" />`,
      `<meta property="article:section" content="${escapeHtmlAttribute(
        categoryBySlug(post.category).label,
      )}" />`,
      `<script type="application/ld+json">${blogPostJsonLd(siteBaseUrl, post, ogImage)}</script>`,
    )
  }
  return tags.join('\n    ')
}

function applyMarketingMetadata(html: string, route: string) {
  const metadata = marketingMetadata(route)
  const ogImage = marketingOgImage(route, metadata)
  const isPost = blogPostByRoute.has(route)
  return html
    .replace(/<title>.*?<\/title>/, `<title>${metadata.title}</title>`)
    .replace(
      /<meta property="og:type" content="[^"]*" \/>/,
      `<meta property="og:type" content="${isPost ? 'article' : 'website'}" />`,
    )
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${escapeHtmlAttribute(metadata.description)}" />`,
    )
    .replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${escapeHtmlAttribute(metadata.title)}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${escapeHtmlAttribute(metadata.description)}" />`,
    )
    .replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${escapeHtmlAttribute(ogImage)}" />`,
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      `<meta name="twitter:title" content="${escapeHtmlAttribute(metadata.title)}" />`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${escapeHtmlAttribute(metadata.description)}" />`,
    )
    .replace(
      /<meta property="twitter:image" content="[^"]*" \/>/,
      `<meta property="twitter:image" content="${escapeHtmlAttribute(ogImage)}" />`,
    )
    .replace('</head>', `  ${marketingHeadExtras(route, ogImage)}\n  </head>`)
}

function marketingOgImage(route: string, metadata: { title: string; description: string }) {
  const blogImage = blogRouteOgImage.get(route)
  if (blogImage) return blogImage

  const sections: Record<string, string> = {
    performance: 'PERFORMANCE',
    diagrams: 'DIAGRAMS',
    blog: 'BLOG',
  }
  const section = route.startsWith('blog/') ? 'BLOG' : sections[route] || 'BUILD'
  return ogImageUrl(siteBaseUrl, {
    title: metadata.title,
    description: metadata.description,
    section,
    eyebrow: route.startsWith('blog') ? 'DEV BLOG' : undefined,
  })
}

async function writeBlogThumbnails(root: string) {
  const posts = await loadRenderedPosts()
  await Promise.all(
    posts.map(async (post) => {
      const target = path.join(root, post.thumbnail.replace(/^\//, ''))
      await fs.mkdir(path.dirname(target), { recursive: true })
      await fs.writeFile(target, renderBlogThumbnailSvg(post.title), 'utf-8')
    }),
  )
}

function renderBlogThumbnailSvg(title: string) {
  const lines = balanceSvgLines(title)
  const firstY = lines.length === 1 ? 345 : lines.length === 2 ? 305 : 270
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeHtmlAttribute(
    title,
  )}">
  <rect width="1200" height="630" fill="#f3f3f3"/>
  <path d="M0 0h1200v630H0z" fill="#f3f3f3"/>
  <path d="M74 94h1052M74 536h1052M146 64v502M1054 64v502" stroke="#d9d9d9" stroke-width="1"/>
  <g transform="translate(460 56)">
    <rect width="280" height="50" rx="7" fill="#f3f3f3" stroke="rgba(0,0,0,.22)"/>
    <rect x="101" y="4" width="175" height="42" rx="5" fill="#e7e7e7"/>
    <text x="24" y="32" font-family="Arial, sans-serif" font-size="20" letter-spacing=".08em" fill="#3d3d3d">DEV</text>
    <text x="124" y="32" font-family="Arial, sans-serif" font-size="20" letter-spacing=".08em" fill="#3d3d3d">BLOG</text>
  </g>
  <g text-anchor="middle" font-family="Georgia, serif" font-size="78" font-weight="400" letter-spacing="-.04em" fill="#050505">
${lines
  .map(
    (line, index) => `    <text x="600" y="${firstY + index * 86}">${escapeHtmlText(line)}</text>`,
  )
  .join('\n')}
  </g>
  <path d="M590 574h-9.203l8.53-26.136h-10.909l2.379-7.66h30.393l-2.379 7.66h-10.326L590 574Z" fill="#050505"/>
</svg>
`
}

function balanceSvgLines(text: string) {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= 3) return [text]
  const maxChars = 26
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  if (lines.length <= 3) return lines
  return [lines[0], lines.slice(1, -1).join(' '), lines.at(-1) as string]
}

function escapeHtmlText(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

export default defineConfig({
  root: 'src/marketing',
  publicDir: path.resolve(process.cwd(), 'public'),
  plugins: [
    blogPostsPlugin(),
    tailwindcss(),
    Icons({ compiler: 'jsx', jsx: 'react' }),
    react(),
    marketingRouteCopies(),
  ],
  resolve: {
    alias: [
      {
        find: 'next/image',
        replacement: path.resolve(process.cwd(), 'src/marketing/next-shims.tsx'),
      },
      {
        find: 'next/link',
        replacement: path.resolve(process.cwd(), 'src/marketing/next-shims.tsx'),
      },
      {
        find: 'next/navigation',
        replacement: path.resolve(process.cwd(), 'src/marketing/next-shims.tsx'),
      },
      { find: 'next', replacement: path.resolve(process.cwd(), 'src/marketing/next-shims.tsx') },
    ],
  },
  build: {
    emptyOutDir: false,
    outDir: '../../dist/public',
    rollupOptions: {
      input: 'index.html',
    },
  },
})
