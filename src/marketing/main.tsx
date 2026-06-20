import {
  lazy,
  type ReactNode,
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createRoot } from 'react-dom/client'
import '../pages/_root.css'
import HomePage from './HomePage'

const loadDiagramsPage = () => import('./DiagramsPage')
const loadFeaturePage = () => import('./FeaturePage')
const loadPerformancePage = () => import('./PerformancePage')

const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((module) => ({ default: module.Analytics })),
)
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then((module) => ({ default: module.SpeedInsights })),
)
const GoogleAnalytics = lazy(() => import('../components/GoogleAnalytics'))
const PostHogSetup = lazy(() => import('../components/PostHogSetup'))
const PerformancePage = lazy(loadPerformancePage)
const DiagramsPage = lazy(loadDiagramsPage)
const FeaturePage = lazy(loadFeaturePage)

function currentRoute() {
  return normalizeRoutePath(window.location.pathname)
}

function normalizeRoutePath(pathname: string) {
  return pathname.replace(/\/$/, '') || '/'
}

const prefetchedPaths = new Set<string>()

function prefetchPath(href: string) {
  if (!href.startsWith('/') || prefetchedPaths.has(href)) return
  prefetchedPaths.add(href)

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  link.as = 'document'
  document.head.appendChild(link)
}

const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Tempo',
    description:
      'The only blockchain designed for payments. Sub-second transactions, sub-cent fees.',
  },
  '/build': {
    title: 'Tempo',
    description:
      'Build payment products on Tempo with stablecoins, fast settlement, and predictable fees.',
  },
  '/build/tempo-transactions': {
    title: 'Tempo Transactions',
    description: 'Batch, sponsor, schedule, and parallelize payments with Tempo Transactions.',
  },
  '/build/tip20-tokens': {
    title: 'TIP-20 Tokens',
    description:
      'Stablecoin-first Tempo Tokens for payments, fees, memos, policies, and liquidity.',
  },
  '/performance': {
    title: 'Tempo Performance',
    description:
      'Nightly benchmarks on Tempo throughput, block times, execution rates, and uptime.',
  },
  '/diagrams': {
    title: 'Tempo Diagrams',
    description: 'A playground for Tempo diagrams, product visuals, and house-style SVG exports.',
  },
}

function isMarketingRoute(pathname: string) {
  return normalizeRoutePath(pathname) in routeMetadata
}

function preloadRoute(pathname: string) {
  const route = normalizeRoutePath(pathname)
  if (route === '/build/tempo-transactions' || route === '/build/tip20-tokens') {
    void loadFeaturePage()
  } else if (route === '/performance') {
    void loadPerformancePage()
  } else if (route === '/diagrams') {
    void loadDiagramsPage()
  }
}

function idFromHash(hash: string) {
  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return hash.slice(1)
  }
}

function metadataForRoute(path: string) {
  if (routeMetadata[path]) return routeMetadata[path]
  return routeMetadata['/']
}

function applyRouteMetadata(path: string) {
  const metadata = metadataForRoute(path)
  document.title = metadata.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description)
}

function renderRoute(path: string): ReactNode {
  if (path === '/' || path === '/build') return <HomePage />
  if (path === '/build/tempo-transactions') return <FeaturePage params={{ slug: 'transactions' }} />
  if (path === '/build/tip20-tokens') return <FeaturePage params={{ slug: 'tokens' }} />
  if (path === '/performance') return <PerformancePage />
  if (path === '/diagrams') return <DiagramsPage />
  return <HomePage />
}

function MarketingApp() {
  const [route, setRoute] = useState(currentRoute)
  const [analyticsReady, setAnalyticsReady] = useState(false)
  const routeRef = useRef(route)
  const pendingScrollRef = useRef<string | null>(null)

  const scrollToPendingTarget = useCallback(() => {
    if (pendingScrollRef.current === null) return
    const hash = pendingScrollRef.current
    pendingScrollRef.current = null

    requestAnimationFrame(() => {
      if (hash) {
        document.getElementById(idFromHash(hash))?.scrollIntoView()
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }
    })
  }, [])

  useEffect(() => {
    routeRef.current = route
    applyRouteMetadata(route)
    scrollToPendingTarget()
  }, [route, scrollToPendingTarget])

  useEffect(() => {
    setAnalyticsReady(false)
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => setAnalyticsReady(true), { timeout: 2_000 })
      return () => window.cancelIdleCallback(idleId)
    }
    const timeoutId = globalThis.setTimeout(() => setAnalyticsReady(true), 1)
    return () => globalThis.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    prefetchPath('/docs')

    const update = () => {
      startTransition(() => setRoute(currentRoute()))
    }
    const navigate = (url: URL) => {
      const nextRoute = normalizeRoutePath(url.pathname)
      pendingScrollRef.current = url.hash
      preloadRoute(nextRoute)
      window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
      if (nextRoute === routeRef.current) {
        applyRouteMetadata(nextRoute)
        scrollToPendingTarget()
        window.dispatchEvent(new CustomEvent('tempo:navigation'))
        return
      }
      startTransition(() => setRoute(nextRoute))
      window.dispatchEvent(new CustomEvent('tempo:navigation'))
    }
    const prefetchAnchor = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.origin !== window.location.origin) return
      prefetchPath(anchor.pathname)
      if (isMarketingRoute(anchor.pathname)) preloadRoute(anchor.pathname)
    }
    const clickAnchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return

      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.target && anchor.target !== '_self') return

      const url = new URL(anchor.href)
      if (url.origin !== window.location.origin || !isMarketingRoute(url.pathname)) return

      event.preventDefault()
      navigate(url)
    }

    window.addEventListener('popstate', update)
    document.addEventListener('click', clickAnchor)
    document.addEventListener('pointerover', prefetchAnchor, { passive: true })
    document.addEventListener('focusin', prefetchAnchor)
    return () => {
      window.removeEventListener('popstate', update)
      document.removeEventListener('click', clickAnchor)
      document.removeEventListener('pointerover', prefetchAnchor)
      document.removeEventListener('focusin', prefetchAnchor)
    }
  }, [scrollToPendingTarget])

  return (
    <>
      <Suspense fallback={null}>{renderRoute(route)}</Suspense>
      {analyticsReady && (
        <Suspense fallback={null}>
          <SpeedInsights route={route} />
          <Analytics />
          <GoogleAnalytics />
          <PostHogSetup site="developers" />
        </Suspense>
      )}
    </>
  )
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Marketing root element was not found')
}

createRoot(rootElement).render(<MarketingApp />)
