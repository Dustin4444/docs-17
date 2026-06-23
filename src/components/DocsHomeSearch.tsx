'use client'

import { openDocsSearch, SearchIcon } from './DocsHeader'

export default function DocsHomeSearch() {
  return (
    <button
      type="button"
      onClick={openDocsSearch}
      aria-label="Search documentation"
      aria-keyshortcuts="Meta+K Control+K"
      className="mt-8 flex min-h-13 w-full max-w-2xl items-center gap-3 rounded-[6px] border border-line bg-foreground/[0.03] px-4 font-sans text-[15px] text-foreground/60 tracking-[0] transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
    >
      <SearchIcon className="size-[18px]" />
      <span className="flex-1 text-left">Search documentation</span>
      <kbd className="hidden rounded-[3px] border border-line px-1.5 py-0.5 font-sans text-[11px] text-foreground/45 sm:inline-block">
        ⌘K
      </kbd>
    </button>
  )
}
