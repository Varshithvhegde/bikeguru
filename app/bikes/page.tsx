"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import BikeCard from "@/components/bikes/BikeCard"
import FilterPanel from "@/components/bikes/FilterPanel"
import { Bike, FilterState } from "@/types/bike"
import { getSessionId } from "@/lib/utils"

const DEFAULT_FILTERS: FilterState = {
  budget_max: 250000,
  budget_min: 0,
  category: [],
  brand: [],
  min_mileage: 0,
  min_power: 0,
  has_abs: false,
  suitable_for: [],
  sort: "price_asc",
}

function BikesContent() {
  const searchParams = useSearchParams()
  const [bikes, setBikes] = useState<Bike[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [compared, setCompared] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterState>(() => {
    const cat = searchParams.get("category")
    return { ...DEFAULT_FILTERS, category: cat ? [cat] : [] }
  })

  const fetchBikes = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("max_price", String(filters.budget_max))
    params.set("sort", filters.sort)
    if (filters.category.length) params.set("category", filters.category.join(","))
    if (filters.brand.length) params.set("brand", filters.brand.join(","))
    if (filters.suitable_for.length) params.set("suitable_for", filters.suitable_for.join(","))
    if (filters.has_abs) params.set("has_abs", "true")
    if (filters.min_mileage > 0) params.set("min_mileage", String(filters.min_mileage))
    if (search) params.set("search", search)

    const res = await fetch(`/api/bikes?${params.toString()}`)
    const data = await res.json()
    setBikes(data.bikes || [])
    setLoading(false)
  }, [filters, search])

  useEffect(() => {
    fetchBikes()
  }, [fetchBikes])

  // Load wishlist from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("bg_wishlist")
    if (stored) {
      try { setWishlist(new Set(JSON.parse(stored))) } catch {}
    }
    const storedCmp = localStorage.getItem("bg_compare")
    if (storedCmp) {
      try { setCompared(new Set(JSON.parse(storedCmp))) } catch {}
    }
  }, [])

  function toggleWishlist(id: string) {
    setWishlist((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem("bg_wishlist", JSON.stringify([...next]))
      // Also sync to supabase
      fetch("/api/wishlist", {
        method: next.has(id) ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json", "x-session-id": getSessionId() },
        body: JSON.stringify({ bike_id: id }),
      })
      return next
    })
  }

  function toggleCompare(id: string) {
    setCompared((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (next.size >= 3) {
          alert("You can compare up to 3 bikes. Remove one first.")
          return prev
        }
        next.add(id)
      }
      localStorage.setItem("bg_compare", JSON.stringify([...next]))
      return next
    })
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--cream)" }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "var(--charcoal)",
          borderBottom: "3px solid var(--coral)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1
            className="text-5xl md:text-7xl text-white mb-2"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            ALL BIKES
            <span style={{ color: "var(--coral)" }}>.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>
            {loading ? "Loading..." : `${bikes.length} bikes found`} — Budget up to ₹{(filters.budget_max / 100000).toFixed(1)}L
          </p>

          {/* Search */}
          <div className="mt-4 relative max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bikes (e.g. Pulsar, KTM...)"
              className="w-full pl-9 pr-9 py-2.5 text-sm border-2"
              style={{
                borderColor: "var(--coral)",
                backgroundColor: "white",
                outline: "none",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid md:grid-cols-[280px_1fr] gap-4 sm:gap-8">
          {/* Filters */}
          <aside>
            <FilterPanel filters={filters} onChange={setFilters} resultCount={bikes.length} />

            {/* Compare tray */}
            {compared.size > 0 && (
              <div
                className="mt-4 p-4"
                style={{ border: "2px solid var(--amber)", backgroundColor: "white" }}
              >
                <p
                  className="text-sm font-black uppercase tracking-wider mb-2"
                  style={{ color: "var(--amber)" }}
                >
                  Compare ({compared.size}/3)
                </p>
                {[...compared].map((id) => {
                  const b = bikes.find((x) => x.id === id)
                  return b ? (
                    <div key={id} className="flex items-center justify-between text-sm py-1">
                      <span className="font-bold">{b.name}</span>
                      <button onClick={() => toggleCompare(id)} style={{ color: "var(--coral)" }}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : null
                })}
                <a
                  href={`/compare?ids=${[...compared].join(",")}`}
                  className="retro-btn-coral text-center py-2 text-xs uppercase tracking-wider block mt-2"
                >
                  Compare Now →
                </a>
              </div>
            )}
          </aside>

          {/* Bike grid */}
          <div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{ height: 320, border: "2px solid var(--border)" }}
                  />
                ))}
              </div>
            ) : bikes.length === 0 ? (
              <div
                className="text-center py-20 retro-border"
                style={{ backgroundColor: "white" }}
              >
                <div style={{ fontSize: 60 }}>🔍</div>
                <p
                  className="text-3xl mt-4"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  NO BIKES FOUND
                </p>
                <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
                  Try adjusting your filters or search term
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {bikes.map((bike, i) => (
                  <div
                    key={bike.id}
                    className="fade-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <BikeCard
                      bike={bike}
                      onWishlist={toggleWishlist}
                      onCompare={toggleCompare}
                      isWishlisted={wishlist.has(bike.id)}
                      isCompared={compared.has(bike.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BikesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-96">
        <p className="text-2xl" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>LOADING BIKES...</p>
      </div>
    }>
      <BikesContent />
    </Suspense>
  )
}
