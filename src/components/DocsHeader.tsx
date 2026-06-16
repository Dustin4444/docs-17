'use client'

import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'

type MegaLink = {
  label: string
  desc: string
  href: string
  icon: ReactNode
}

type MegaColumn = { title: string; items: MegaLink[] }
type MegaMenuData = { columns: MegaColumn[] }
type MenuItem = { label: string; href: string; mega?: MegaMenuData }

const DOCS_BASE_PATH = '/docs'
const TEMPO_DOCS_SKILL_URL = `${DOCS_BASE_PATH}/guide/using-tempo-with-ai#docs-skill`
const TEMPO_MCP_URL = 'https://mcp.tempo.xyz'

function isExternal(href: string) {
  return !href.startsWith('/') && !href.startsWith('#')
}

function normalizePath(pathname: string) {
  return pathname.replace(/^\/docs(?=\/|$)/, '') || '/'
}

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function usePathname() {
  const [pathname, setPathname] = useState('/')

  useLayoutEffect(() => {
    const update = () => setPathname(normalizePath(window.location.pathname))
    update()
    window.addEventListener('popstate', update)
    window.addEventListener('hashchange', update)
    return () => {
      window.removeEventListener('popstate', update)
      window.removeEventListener('hashchange', update)
    }
  }, [])

  return pathname
}

function isActiveMenuItem(pathname: string, item: MenuItem) {
  if (item.label === 'Docs') return true
  if (item.label === 'Developers')
    return ['/api', '/sdks', '/wallet'].some((href) => pathMatches(pathname, href))
  return !isExternal(item.href) && pathMatches(pathname, item.href)
}

function Anchor({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) return <a {...props}>{children}</a>
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }
  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative external-link icon.
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M7 17 17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function TempoMark({ className }: { className?: string }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative mark sits inside the home link.
    <svg viewBox="0 0 14.2604 14.8395" fill="none" aria-hidden className={className}>
      <path
        d="M5.03996 14.8395H1.03534L4.74694 3.36361H0L1.03534 0H14.2604L13.225 3.36361H8.73202L5.03996 14.8395Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Glyph({ children }: { children: ReactNode }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative mega-menu icon.
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

function AccountsIcon() {
  return (
    <Glyph>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </Glyph>
  )
}

function TransactionsIcon() {
  return (
    <Glyph>
      <path d="M7 8h10M14 5l3 3-3 3" />
      <path d="M17 16H7M10 13l-3 3 3 3" />
    </Glyph>
  )
}

function TokensIcon() {
  return (
    <Glyph>
      <circle cx="9.5" cy="12" r="4.5" />
      <circle cx="14.5" cy="12" r="4.5" />
    </Glyph>
  )
}

function ZonesIcon() {
  return (
    <Glyph>
      <rect x="6.5" y="10.5" width="11" height="8" rx="1.5" />
      <path d="M9 10.5V8a3 3 0 0 1 6 0v2.5" />
      <circle cx="12" cy="14.2" r="1" />
    </Glyph>
  )
}

function DocsIcon() {
  return (
    <Glyph>
      <rect x="6" y="3.5" width="12" height="17" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </Glyph>
  )
}

function WalletIcon() {
  return (
    <Glyph>
      <rect x="4" y="6.5" width="16" height="12" rx="2.5" />
      <path d="M4 9.5h12a2 2 0 0 1 2 2" />
      <circle cx="16.5" cy="12.5" r="1" />
    </Glyph>
  )
}

function ApiIcon() {
  return (
    <Glyph>
      <path d="M9 5c-2 0-2 2-2 3.4 0 1.4-.4 2.6-2 2.6 1.6 0 2 1.2 2 2.6C7 17 7 19 9 19" />
      <path d="M15 5c2 0 2 2 2 3.4 0 1.4.4 2.6 2 2.6-1.6 0-2 1.2-2 2.6C17 17 17 19 15 19" />
    </Glyph>
  )
}

function ExplorerIcon() {
  return (
    <Glyph>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m15 15 4 4" />
      <path d="M8.5 11h5M11 8.5v5" />
    </Glyph>
  )
}

function SdkIcon() {
  return (
    <Glyph>
      <path d="M12 3 20 7v10l-8 4-8-4V7z" />
      <path d="M4 7l8 4 8-4M12 11v10" />
    </Glyph>
  )
}

function McpIcon() {
  return (
    <Glyph>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M9 7V4M15 7V4M9 20v-3M15 20v-3M7 9H4M7 15H4M20 9h-3M20 15h-3" />
    </Glyph>
  )
}

function TerminalIcon() {
  return (
    <Glyph>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 10l2.5 2.5L8 15M13 15h3" />
    </Glyph>
  )
}

const protocolMenu: MegaMenuData = {
  columns: [
    {
      title: 'Accounts',
      items: [
        {
          label: 'Accounts',
          desc: 'Passkeys, thresholds & access keys',
          href: '/features/accounts',
          icon: <AccountsIcon />,
        },
      ],
    },
    {
      title: 'Transactions',
      items: [
        {
          label: 'Transactions',
          desc: 'Batch, sponsor, schedule & parallelize',
          href: '/features/transactions',
          icon: <TransactionsIcon />,
        },
      ],
    },
    {
      title: 'Assets & privacy',
      items: [
        {
          label: 'Tokens',
          desc: 'TIP-20 payment tokens for stablecoins',
          href: '/features/tokens',
          icon: <TokensIcon />,
        },
        {
          label: 'Zones',
          desc: 'Private execution environments',
          href: '/features/zones',
          icon: <ZonesIcon />,
        },
      ],
    },
  ],
}

const developersMenu: MegaMenuData = {
  columns: [
    {
      title: 'Documentation',
      items: [
        {
          label: 'Docs',
          desc: 'Guides, references & quickstart',
          href: `${DOCS_BASE_PATH}/guide`,
          icon: <DocsIcon />,
        },
      ],
    },
    {
      title: 'Tools',
      items: [
        {
          label: 'Tempo Wallet',
          desc: 'Embeddable passkey wallet',
          href: '/wallet',
          icon: <WalletIcon />,
        },
        {
          label: 'Tempo API',
          desc: 'Tx, tokens, DEX, prices & metadata',
          href: '/api',
          icon: <ApiIcon />,
        },
        {
          label: 'Tempo Explorer',
          desc: 'Search blocks, txs & accounts',
          href: 'https://explorer.tempo.xyz',
          icon: <ExplorerIcon />,
        },
      ],
    },
    {
      title: 'Libraries',
      items: [
        {
          label: 'Accounts SDK',
          desc: 'Add stablecoins in a few lines',
          href: 'https://accounts.tempo.xyz',
          icon: <SdkIcon />,
        },
        {
          label: 'MPP',
          desc: 'Paid requests & agentic payments',
          href: 'https://mpp.dev/',
          icon: <McpIcon />,
        },
        {
          label: 'SDKs',
          desc: 'TypeScript, Rust, Go & Foundry',
          href: '/sdks',
          icon: <TerminalIcon />,
        },
      ],
    },
  ],
}

const menu: MenuItem[] = [
  { label: 'Protocol', href: '/#protocol', mega: protocolMenu },
  { label: 'Developers', href: '/', mega: developersMenu },
  { label: 'Performance', href: '/performance' },
  { label: 'Blog', href: '/blog' },
  { label: 'Docs', href: DOCS_BASE_PATH },
]

function ActiveSquare({ activeKey }: { activeKey: string }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative active-state indicator.
    <svg
      key={activeKey}
      viewBox="0 0 11 11"
      aria-hidden
      className="nav-active-square size-[11px] shrink-0 text-white/70"
    >
      {[0, 4, 8].flatMap((y) =>
        [0, 4, 8].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={3} height={3} fill="currentColor" />
        )),
      )}
    </svg>
  )
}

function MegaItem({ link }: { link: MegaLink }) {
  const external = isExternal(link.href)
  return (
    <Anchor
      href={link.href}
      className="group/item relative flex items-start gap-3 rounded-[4px] px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
    >
      {external ? (
        <ArrowUpRight className="absolute top-2.5 right-3 size-3 text-white/35 transition-colors group-hover/item:text-white/60" />
      ) : null}
      <span className="grid size-[34px] shrink-0 place-items-center bg-surface-input text-foreground">
        {link.icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-sans text-[14px] text-foreground tracking-[0]">{link.label}</span>
        <span className="font-sans text-[13px] text-white/45 leading-[1.4] tracking-[0]">
          {link.desc}
        </span>
      </span>
    </Anchor>
  )
}

function MegaMenu({ data }: { data: MegaMenuData }) {
  return (
    <div className="flex w-max gap-1 p-3">
      {data.columns.map((column) => {
        return (
          <div key={column.title} className="w-[224px]">
            <p className="px-3 pt-2 pb-1.5 font-sans text-[13px] text-white/35 tracking-[0]">
              {column.title}
            </p>
            <ul>
              {column.items.map((item) => (
                <li key={item.label}>
                  <MegaItem link={item} />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function MenuIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Button provides the accessible label.
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 7h14M3 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Button provides the accessible label.
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function RobotIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative icon next to visible text.
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <rect x="5" y="9.5" width="14" height="10" rx="2" />
      <path d="M12 9.5V6" />
      <circle cx="12" cy="4.5" r="1.2" />
      <path d="M9.5 13.5v2M14.5 13.5v2" />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative disclosure icon; button exposes expanded state.
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`shrink-0 text-white/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CopyIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Parent copy button provides the accessible label.
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="5.25"
        y="5.25"
        width="8.5"
        height="8.5"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M10.75 3.25V3C10.75 1.9 9.85 1 8.75 1H3C1.9 1 1 1.9 1 3V8.75C1 9.85 1.9 10.75 3 10.75H3.25"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Parent copy button provides the accessible label.
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 8.5L6.5 12L13 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const mcpCommands = [
  { label: 'Claude Code', prefix: 'claude mcp add --transport http tempo ' },
  { label: 'Codex CLI', prefix: 'codex mcp add tempo --url ' },
]

function AgentMenuItem(props: {
  href: string
  label: string
  desc: string
  icon: ReactNode
  onClick?: () => void
}) {
  const { href, label, desc, icon, onClick } = props
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="group/item relative flex items-start gap-3 rounded-[4px] px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
    >
      <ArrowUpRight className="absolute top-2.5 right-3 size-3 text-white/35 transition-colors group-hover/item:text-white/60" />
      <span className="grid size-[34px] shrink-0 place-items-center bg-surface-input text-foreground">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-sans text-[14px] text-foreground tracking-[0]">{label}</span>
        <span className="font-sans text-[13px] text-white/45 leading-[1.4] tracking-[0]">
          {desc}
        </span>
      </span>
    </a>
  )
}

function AgentsPanel({
  variant = 'desktop',
  onNavigate,
}: {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}) {
  const desktop = variant === 'desktop'
  const [activeCommandIndex, setActiveCommandIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const activeCommand = mcpCommands[activeCommandIndex]

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(activeCommand.prefix + TEMPO_MCP_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className={desktop ? 'w-[520px] p-3' : 'pb-4 pl-3'}>
      {desktop ? (
        <p className="px-3 pt-2 pb-1.5 font-sans text-[13px] text-white/35 tracking-[0]">
          Agent tools
        </p>
      ) : null}
      <div className="space-y-1">
        <AgentMenuItem
          href={TEMPO_DOCS_SKILL_URL}
          label="Tempo Docs skill"
          desc="Install Tempo context for AI agents"
          icon={<DocsIcon />}
          onClick={onNavigate}
        />
        <div className="rounded-[4px] px-3 py-2.5">
          <div className="flex items-start gap-3">
            <span className="grid size-[34px] shrink-0 place-items-center bg-surface-input text-foreground">
              <McpIcon />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-sans text-[14px] text-foreground tracking-[0]">
                Tempo MCP server
              </span>
              <span className="font-sans text-[13px] text-white/45 leading-[1.4] tracking-[0]">
                Connect agents to Tempo docs & code
              </span>
            </span>
          </div>
          <div className="mt-3 ml-[52px] space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {mcpCommands.map((item, index) => {
                const active = index === activeCommandIndex
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setActiveCommandIndex(index)
                      setCopied(false)
                    }}
                    className={`rounded-[4px] px-2.5 py-1.5 font-sans text-[12px] tracking-[0] transition-colors ${
                      active
                        ? 'bg-white/[0.06] text-foreground'
                        : 'text-white/40 hover:bg-white/[0.03] hover:text-white/70'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={copyCommand}
              aria-label="Copy install command"
              className="group/copy flex w-full items-center gap-3 rounded-[4px] bg-white/[0.035] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
            >
              <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-[12px] text-foreground">
                {activeCommand.prefix}
                <span className="text-white/65">{TEMPO_MCP_URL}</span>
              </code>
              <span
                className={`shrink-0 transition-colors ${copied ? 'text-foreground' : 'text-white/35 group-hover/copy:text-white/70'}`}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function megaLinks(data: MegaMenuData) {
  return data.columns.flatMap((column) => column.items)
}

export default function DocsHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [geom, setGeom] = useState<{ x: number; w: number; h: number } | null>(null)
  const [morphing, setMorphing] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const triggerRefs = useRef(new Map<string, HTMLElement>())
  const panelRefs = useRef(new Map<string, HTMLDivElement>())
  const prevActive = useRef<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }
  const openMenu = (key: string) => {
    cancelClose()
    setActiveMenu(key)
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120)
  }

  useLayoutEffect(() => {
    if (!activeMenu) {
      prevActive.current = null
      return
    }
    const panel = panelRefs.current.get(activeMenu)
    const trigger = triggerRefs.current.get(activeMenu)
    const header = headerRef.current
    if (!panel || !trigger || !header) return
    const w = panel.offsetWidth
    const h = panel.offsetHeight
    const triggerRect = trigger.getBoundingClientRect()
    const headerRect = header.getBoundingClientRect()
    const raw =
      activeMenu === 'For agents'
        ? triggerRect.right - headerRect.left - w
        : triggerRect.left - headerRect.left + triggerRect.width / 2 - w / 2
    const x = Math.round(Math.min(Math.max(raw, 12), headerRect.width - w - 12))
    setMorphing(prevActive.current !== null)
    setGeom({ x, w, h })
    prevActive.current = activeMenu
  }, [activeMenu])

  const dropdowns: { key: string; panel: ReactNode }[] = [
    ...menu.flatMap((item) =>
      item.mega ? [{ key: item.label, panel: <MegaMenu data={item.mega} /> }] : [],
    ),
    { key: 'For agents', panel: <AgentsPanel /> },
  ]

  const close = () => {
    setOpen(false)
    setExpanded(null)
  }

  return (
    <header className="docs-site-header fixed top-0 right-0 left-0 z-[60] bg-background">
      <nav
        ref={headerRef}
        className="mx-auto flex max-w-7xl items-center justify-between border-line border-x border-b bg-surface-page px-5 py-4"
      >
        <a href="/" onClick={close} className="group flex items-center">
          <span className="grid h-8 w-8 shrink-0 place-items-center">
            <TempoMark className="h-3.5 w-3.5 text-foreground" />
          </span>
          <span className="flex h-8 items-center whitespace-nowrap px-2 font-sans text-[14px] text-white/50 tracking-[0]">
            Developers
          </span>
        </a>

        <ul className="hidden items-center gap-16 lg:flex">
          {menu.map((item) => {
            const active = isActiveMenuItem(pathname, item)
            const triggerContent = (
              <>
                {active ? <ActiveSquare activeKey={pathname} /> : null}
                {item.label}
                {item.mega ? (
                  // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative disclosure icon; button exposes expanded state.
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                    className={`shrink-0 text-white/40 transition-transform duration-200 ease-out ${activeMenu === item.label ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </>
            )

            return (
              <li
                key={item.label}
                onMouseEnter={item.mega ? () => openMenu(item.label) : scheduleClose}
                onMouseLeave={item.mega ? scheduleClose : undefined}
              >
                {item.mega ? (
                  <button
                    ref={(element) => {
                      if (element) triggerRefs.current.set(item.label, element)
                      else triggerRefs.current.delete(item.label)
                    }}
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={activeMenu === item.label}
                    onFocus={() => openMenu(item.label)}
                    onBlur={scheduleClose}
                    className="relative flex items-center gap-1.5 font-sans text-[14px] text-foreground tracking-[0] transition-opacity hover:opacity-70"
                  >
                    {triggerContent}
                  </button>
                ) : (
                  <Anchor
                    href={item.href}
                    className="relative flex items-center gap-1.5 font-sans text-[14px] text-foreground tracking-[0] transition-opacity hover:opacity-70"
                  >
                    {triggerContent}
                  </Anchor>
                )}
              </li>
            )
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            ref={(element) => {
              if (element) triggerRefs.current.set('For agents', element)
              else triggerRefs.current.delete('For agents')
            }}
            type="button"
            aria-haspopup="true"
            aria-expanded={activeMenu === 'For agents'}
            onMouseEnter={() => openMenu('For agents')}
            onMouseLeave={scheduleClose}
            onFocus={() => openMenu('For agents')}
            onBlur={scheduleClose}
            className="flex h-9 items-center gap-2 rounded-[4px] border border-line px-4 font-sans text-[14px] text-foreground tracking-[0] transition-colors hover:bg-white/[0.04]"
          >
            <RobotIcon />
            For agents
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: Decorative disclosure icon; button exposes expanded state. */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className={`shrink-0 text-white/40 transition-transform duration-200 ease-out ${activeMenu === 'For agents' ? 'rotate-180' : ''}`}
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="grid size-8 place-items-center text-foreground lg:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      <div className="pointer-events-none absolute top-full right-0 left-0 z-50 hidden lg:block">
        <div className="mx-auto max-w-7xl">
          <div
            className={`transition duration-200 ease-out will-change-[opacity,transform,filter] motion-reduce:transition-none ${
              activeMenu
                ? 'translate-y-0 opacity-100 [filter:blur(0px)]'
                : '-translate-y-2 opacity-0 [filter:blur(8px)]'
            }`}
          >
            {/* biome-ignore lint/a11y/noStaticElementInteractions: Hover bridge keeps the shared menu surface open. */}
            <div
              role="presentation"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              onFocus={cancelClose}
              onBlur={scheduleClose}
              style={{ transform: `translateX(${geom?.x ?? 0}px)` }}
              className={`w-max pt-3 ${activeMenu ? 'pointer-events-auto' : ''} ${morphing ? 'transition-transform duration-200 ease-out motion-reduce:transition-none' : ''}`}
            >
              <div
                style={{ width: geom?.w, height: geom?.h }}
                className={`relative overflow-hidden rounded-md border border-line bg-surface-page shadow-2xl ${
                  morphing
                    ? 'transition-[width,height] duration-200 ease-out motion-reduce:transition-none'
                    : ''
                }`}
              >
                {dropdowns.map(({ key, panel }) => (
                  <div
                    key={key}
                    ref={(element) => {
                      if (element) panelRefs.current.set(key, element)
                      else panelRefs.current.delete(key)
                    }}
                    className={`absolute top-0 left-0 w-max transition-opacity duration-150 ease-out motion-reduce:transition-none ${
                      activeMenu === key ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                  >
                    {panel}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute top-full right-0 left-0 z-40 origin-top transition duration-200 ease-out lg:hidden ${
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col border-line border-x border-b bg-background px-5 pb-5">
          {menu.map((item) => {
            const active = isActiveMenuItem(pathname, item)
            return item.mega ? (
              <div key={item.label} className="border-line border-t">
                <button
                  type="button"
                  onClick={() => setExpanded((value) => (value === item.label ? null : item.label))}
                  aria-expanded={expanded === item.label}
                  className="flex w-full items-center justify-between py-4 font-sans text-[16px] text-foreground tracking-[0]"
                >
                  <span className="flex items-center gap-2">
                    {active ? <ActiveSquare activeKey={pathname} /> : null}
                    {item.label}
                  </span>
                  <Chevron open={expanded === item.label} />
                </button>
                <div
                  className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${expanded === item.label ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="flex flex-col gap-3 pb-4 pl-3">
                      {megaLinks(item.mega).map((sub) => (
                        <Anchor
                          key={sub.label}
                          href={sub.href}
                          onClick={close}
                          className="flex items-start gap-1.5 font-sans text-[15px] text-white/50 tracking-[0] transition-colors hover:text-white"
                        >
                          {sub.label}
                          {isExternal(sub.href) ? <ArrowUpRight className="mt-0.5 size-3" /> : null}
                        </Anchor>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Anchor
                key={item.label}
                href={item.href}
                onClick={close}
                className="flex items-start gap-1.5 border-line border-t py-4 font-sans text-[16px] text-foreground tracking-[0]"
              >
                {active ? <ActiveSquare activeKey={pathname} /> : null}
                {item.label}
              </Anchor>
            )
          })}
          <div className="border-line border-t">
            <button
              type="button"
              onClick={() => setExpanded((value) => (value === 'For agents' ? null : 'For agents'))}
              aria-expanded={expanded === 'For agents'}
              className="flex w-full items-center justify-between py-4 font-sans text-[16px] text-foreground tracking-[0]"
            >
              For agents
              <Chevron open={expanded === 'For agents'} />
            </button>
            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${expanded === 'For agents' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="min-h-0 overflow-hidden">
                <AgentsPanel variant="mobile" onNavigate={close} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
