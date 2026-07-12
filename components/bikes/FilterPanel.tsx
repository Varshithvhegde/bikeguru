"use client"

import { FilterState } from "@/types/bike"
import { SlidersHorizontal, X, ChevronDown } from "lucide-react"
import { useState } from "react"

const CATEGORIES = ["commuter", "sport", "adventure", "cruiser", "scooter"]
const BRANDS = ["Hero", "Bajaj", "TVS", "Honda", "Yamaha", "Royal Enfield", "KTM", "Kawasaki", "Suzuki"]
const USE_CASES = ["commute", "highway", "city", "sport", "touring"]
const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Best Rated" },
  { value: "mileage", label: "Best Mileage" },
  { value: "power", label: "Most Powerful" },
]

interface FilterPanelProps {
  filters: FilterState
  onChange: (f: FilterState) => void
  resultCount?: number
}

function PillBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tag-pill text-xs capitalize press-active transition-colors"
      style={{
        backgroundColor: active ? "var(--charcoal)" : "transparent",
        color: active ? "white" : "var(--charcoal)",
      }}
    >
      {label}
    </button>
  )
}

export default function FilterPanel({ filters, onChange, resultCount }: FilterPanelProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  function toggle<K extends keyof FilterState>(key: K, val: string) {
    const arr = filters[key] as string[]
    onChange({ ...filters, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] })
  }

  function reset() {
    onChange({ budget_max: 350000, budget_min: 0, category: [], brand: [], min_mileage: 0, min_power: 0, has_abs: false, suitable_for: [], sort: "price_asc" })
  }

  const activeCount = filters.category.length + filters.brand.length + filters.suitable_for.length + (filters.has_abs ? 1 : 0) + (filters.min_mileage > 0 ? 1 : 0)

  const filterBody = (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>Sort By</p>
        <select
          value={filters.sort}
          onChange={e => onChange({ ...filters, sort: e.target.value as FilterState["sort"] })}
          className="w-full px-3 py-2 text-sm font-bold appearance-none"
          style={{ border: "2px solid var(--charcoal)", outline: "none", backgroundColor: "white" }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Budget */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Max Budget</p>
          <span className="text-sm font-black" style={{ color: "var(--coral)" }}>₹{(filters.budget_max / 100000).toFixed(1)}L</span>
        </div>
        <input type="range" min={50000} max={400000} step={5000} value={filters.budget_max}
          onChange={e => onChange({ ...filters, budget_max: Number(e.target.value) })}
          className="w-full" style={{ accentColor: "var(--coral)" }}
        />
        <div className="flex justify-between text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>
          <span>₹50K</span><span>₹4L</span>
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>Category</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => <PillBtn key={c} label={c} active={filters.category.includes(c)} onClick={() => toggle("category", c)} />)}
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>Brand</p>
        <div className="flex flex-wrap gap-1.5">
          {BRANDS.map(b => <PillBtn key={b} label={b} active={filters.brand.includes(b)} onClick={() => toggle("brand", b)} />)}
        </div>
      </div>

      {/* Best for */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>Best For</p>
        <div className="flex flex-wrap gap-1.5">
          {USE_CASES.map(u => (
            <button key={u} onClick={() => toggle("suitable_for", u)} className="tag-pill text-xs capitalize press-active"
              style={{ backgroundColor: filters.suitable_for.includes(u) ? "var(--coral)" : "transparent", color: filters.suitable_for.includes(u) ? "white" : "var(--charcoal)", borderColor: filters.suitable_for.includes(u) ? "var(--coral)" : "var(--charcoal)" }}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Min mileage */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Min Mileage</p>
          <span className="text-sm font-black" style={{ color: "var(--coral)" }}>{filters.min_mileage > 0 ? `${filters.min_mileage}+ kmpl` : "Any"}</span>
        </div>
        <input type="range" min={0} max={70} step={5} value={filters.min_mileage}
          onChange={e => onChange({ ...filters, min_mileage: Number(e.target.value) })}
          className="w-full" style={{ accentColor: "var(--coral)" }}
        />
      </div>

      {/* ABS */}
      <div className="flex items-center gap-3">
        <button onClick={() => onChange({ ...filters, has_abs: !filters.has_abs })}
          className="w-10 h-5 rounded-full transition-colors relative flex-shrink-0"
          style={{ backgroundColor: filters.has_abs ? "var(--coral)" : "var(--border)" }}
        >
          <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: filters.has_abs ? "translateX(20px)" : "translateX(2px)" }} />
        </button>
        <span className="text-sm font-bold uppercase tracking-wider">ABS Only</span>
      </div>
    </div>
  )

  return (
    <>
      {/* ── MOBILE: trigger button ── */}
      <div className="md:hidden mb-3 flex items-center gap-2">
        <button
          onClick={() => setSheetOpen(true)}
          className="retro-btn flex items-center gap-2 px-4 py-2.5 text-sm uppercase tracking-wider press-active flex-1 justify-center"
          style={{ backgroundColor: "white" }}
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white" style={{ backgroundColor: "var(--coral)" }}>
              {activeCount}
            </span>
          )}
        </button>
        <select
          value={filters.sort}
          onChange={e => onChange({ ...filters, sort: e.target.value as FilterState["sort"] })}
          className="retro-btn px-3 py-2.5 text-xs font-bold appearance-none flex-1"
          style={{ backgroundColor: "white", outline: "none", border: "2px solid var(--charcoal)" }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* ── MOBILE: bottom sheet ── */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSheetOpen(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white slide-up flex flex-col"
            style={{ maxHeight: "85vh", borderTop: "3px solid var(--coral)", borderLeft: "3px solid var(--charcoal)", borderRight: "3px solid var(--charcoal)" }}
          >
            {/* Sheet header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ backgroundColor: "var(--charcoal)", borderBottom: "2px solid var(--coral)" }}>
              <p className="text-lg text-white" style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.06em" }}>
                FILTERS {activeCount > 0 && <span style={{ color: "var(--coral)" }}>({activeCount})</span>}
              </p>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button onClick={reset} className="text-xs font-bold uppercase" style={{ color: "var(--coral)" }}>Reset</button>
                )}
                <button onClick={() => setSheetOpen(false)} style={{ color: "rgba(255,255,255,0.6)" }}><X size={20} /></button>
              </div>
            </div>
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4">
              {filterBody}
            </div>
            {/* Apply button */}
            <div className="p-4 flex-shrink-0" style={{ borderTop: "2px solid var(--border)", paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
              <button
                onClick={() => setSheetOpen(false)}
                className="w-full retro-btn-coral py-3 text-sm uppercase tracking-wider font-black"
              >
                Show {resultCount !== undefined ? `${resultCount} Bikes` : "Results"} →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── DESKTOP: sidebar ── */}
      <div className="hidden md:block bg-white retro-border p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xl" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>
            FILTERS {activeCount > 0 && <span className="text-sm px-2 py-0.5 font-bold ml-1" style={{ backgroundColor: "var(--coral)", color: "white" }}>{activeCount}</span>}
          </p>
          {activeCount > 0 && (
            <button onClick={reset} className="text-xs font-bold uppercase flex items-center gap-1" style={{ color: "var(--coral)" }}>
              <X size={11} /> Reset
            </button>
          )}
        </div>
        {filterBody}
      </div>
    </>
  )
}
