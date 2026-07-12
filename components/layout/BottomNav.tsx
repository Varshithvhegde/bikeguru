"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, GitCompare, Heart, BookmarkCheck } from "lucide-react"

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/bikes", icon: Search, label: "Bikes" },
  { href: "/compare", icon: GitCompare, label: "Compare" },
  { href: "/comparisons", icon: BookmarkCheck, label: "Saved" },
  { href: "/wishlist", icon: Heart, label: "Wishlist" },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        backgroundColor: "var(--charcoal)",
        borderTop: "3px solid var(--coral)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-stretch">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
              style={{
                color: active ? "var(--coral)" : "rgba(255,255,255,0.5)",
                backgroundColor: active ? "rgba(232,88,61,0.12)" : "transparent",
                borderTop: active ? "2px solid var(--coral)" : "2px solid transparent",
                minHeight: 52,
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
