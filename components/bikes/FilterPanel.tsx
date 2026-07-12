"use client"

import { FilterState } from "@/types/bike"
import { SlidersHorizontal, X } from "lucide-react"
import { useState } from "react"

const CATEGORIES = ["commuter", "sport", "adventure", "cruiser", "scooter"]
const BRANDS = ["Hero", "Bajaj", "TVS", "Honda", "Yamaha", "Royal Enfield", "KTM", "Kawasaki", "Suzuki"]
const USE_CASES = ["commute", "highway", "city", "sport", "touring"]
const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
  { value: "mileage", label: "Best Mileage" },
  { value: "power", label: "Most Powerful" },
]

interface FilterPanelProps {
  filters: FilterState
  onChange: (f: FilterState) => void
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false)

  function toggle<K extends keyof FilterState>(key: K, val: string) {
    const arr = filters[key] as string[]
    onChange({
      ...filters,
      [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
    })
  }

  function resetFilters() {
    onChange({
      budget_max: 250000,
      budget_min: 0,
      category: [],
      brand: [],
      min_mileage: 0,
      min_power: 0,
      has_abs: false,
      suitable_for: [],
      sort: "price_asc",
    })
  }

  const activeCount =
    filters.category.length +
    filters.brand.length +
    filters.suitable_for.length +
    (filters.has_abs ? 1 : 0) +
    (filters.min_mileage > 0 ? 1 : 0) +
    (filters.budget_min > 0 ? 1 : 0)

  return (
    <div>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden retro-btn flex items-center gap-2 px-4 py-2 mb-4 text-sm uppercase tracking-wider"
        style={{ backgroundColor: "white" }}
      >
        <SlidersHorizontal size={16} />
        Filters
        {activeCount > 0 && (
          <span
            className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
            style={{ backgroundColor: "var(--coral)" }}
          >
            {activeCount}
          </span>
        )}
      </button>

      <div
        className={`${open ? "block" : "hidden"} md:block`}
        style={{
          backgroundColor: "white",
          border: "2px solid var(--charcoal)",
          padding: "1.5rem",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xl"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            FILTERS
            {activeCount > 0 && (
              <span
                className="ml-2 text-sm px-2 py-0.5 font-bold"
                style={{ backgroundColor: "var(--coral)", color: "white" }}
              >
                {activeCount} active
              </span>
            )}
          </h3>
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold uppercase flex items-center gap-1"
              style={{ color: "var(--coral)" }}
            >
              <X size={12} /> Reset
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
            Sort By
          </p>
          <select
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value as FilterState["sort"] })}
            className="w-full px-3 py-2 text-sm font-bold border-2 border-charcoal appearance-none"
            style={{ borderColor: "var(--charcoal)", outline: "none" }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
            Max Budget
          </p>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-black"
              style={{ color: "var(--coral)" }}
            >
              ₹{(filters.budget_max / 100000).toFixed(1)}L
            </span>
          </div>
          <input
            type="range"
            min={50000}
            max={350000}
            step={5000}
            value={filters.budget_max}
            onChange={(e) => onChange({ ...filters, budget_max: Number(e.target.value) })}
            className="w-full mt-2"
            style={{ accentColor: "var(--coral)" }}
          />
          <div className="flex justify-between text-xs" style={{ color: "var(--muted)" }}>
            <span>₹50K</span>
            <span>₹3.5L</span>
          </div>
        </div>

        {/* Category */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
            Category
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => toggle("category", c)}
                className="tag-pill text-xs capitalize"
                style={{
                  backgroundColor: filters.category.includes(c) ? "var(--charcoal)" : "transparent",
                  color: filters.category.includes(c) ? "white" : "var(--charcoal)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
            Brand
          </p>
          <div className="flex flex-wrap gap-1.5">
            {BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => toggle("brand", b)}
                className="tag-pill text-xs"
                style={{
                  backgroundColor: filters.brand.includes(b) ? "var(--charcoal)" : "transparent",
                  color: filters.brand.includes(b) ? "white" : "var(--charcoal)",
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Use case */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
            Best For
          </p>
          <div className="flex flex-wrap gap-1.5">
            {USE_CASES.map((u) => (
              <button
                key={u}
                onClick={() => toggle("suitable_for", u)}
                className="tag-pill text-xs capitalize"
                style={{
                  backgroundColor: filters.suitable_for.includes(u) ? "var(--coral)" : "transparent",
                  color: filters.suitable_for.includes(u) ? "white" : "var(--charcoal)",
                  borderColor: filters.suitable_for.includes(u) ? "var(--coral)" : "var(--charcoal)",
                }}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Min mileage */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
            Min Mileage: {filters.min_mileage > 0 ? `${filters.min_mileage} kmpl` : "Any"}
          </p>
          <input
            type="range"
            min={0}
            max={70}
            step={5}
            value={filters.min_mileage}
            onChange={(e) => onChange({ ...filters, min_mileage: Number(e.target.value) })}
            className="w-full"
            style={{ accentColor: "var(--coral)" }}
          />
        </div>

        {/* ABS */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChange({ ...filters, has_abs: !filters.has_abs })}
            className="w-10 h-5 rounded-full transition-colors relative"
            style={{
              backgroundColor: filters.has_abs ? "var(--coral)" : "var(--border)",
            }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              style={{
                transform: filters.has_abs ? "translateX(20px)" : "translateX(2px)",
              }}
            />
          </button>
          <span className="text-sm font-bold uppercase tracking-wider">ABS Only</span>
        </div>
      </div>
    </div>
  )
}
