"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Heart, GitCompare, Bike } from "lucide-react"

const links = [
  { href: "/", label: "Home" },
  { href: "/bikes", label: "All Bikes" },
  { href: "/compare", label: "Compare" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/admin", label: "⚙ Add Bike" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "var(--charcoal)",
        borderBottom: "3px solid var(--coral)",
      }}
    >
      {/* Ticker */}
      <div
        className="overflow-hidden py-1 text-xs font-bold tracking-widest uppercase"
        style={{ backgroundColor: "var(--coral)", color: "white" }}
      >
        <div className="flex animate-marquee whitespace-nowrap">
          {[
            "Budget: Up to ₹2.5L On-Road",
            "20+ Bikes Compared",
            "AI Chatbot Ready",
            "Compare Side-by-Side",
            "Save to Wishlist",
            "Real Specs · Real Prices",
            "Budget: Up to ₹2.5L On-Road",
            "20+ Bikes Compared",
            "AI Chatbot Ready",
            "Compare Side-by-Side",
          ].map((t, i) => (
            <span key={i} className="mx-8">
              ◆ {t}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{
              backgroundColor: "var(--coral)",
              border: "2px solid white",
            }}
          >
            <Bike size={16} color="white" />
          </div>
          <span
            className="text-2xl font-bold tracking-wider"
            style={{
              fontFamily: "var(--font-bebas), sans-serif",
              color: "white",
              letterSpacing: "0.08em",
            }}
          >
            BIKE<span style={{ color: "var(--coral)" }}>GURU</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-4 py-1.5 text-sm font-bold uppercase tracking-wider transition-colors"
              style={{
                color: pathname === l.href ? "var(--coral)" : "rgba(255,255,255,0.8)",
                borderBottom: pathname === l.href ? "2px solid var(--coral)" : "2px solid transparent",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/wishlist"
            className="retro-btn px-3 py-1.5 text-sm flex items-center gap-1.5"
            style={{ backgroundColor: "transparent", color: "white" }}
          >
            <Heart size={14} />
            Wishlist
          </Link>
          <Link
            href="/compare"
            className="retro-btn-coral px-3 py-1.5 text-sm flex items-center gap-1.5"
          >
            <GitCompare size={14} />
            Compare
          </Link>
        </div>

        {/* Mobile menu */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div
          className="md:hidden px-4 pb-4 flex flex-col gap-2"
          style={{ backgroundColor: "var(--charcoal)" }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm font-bold uppercase tracking-wider border-b"
              style={{
                color: pathname === l.href ? "var(--coral)" : "white",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
