"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X, Heart, ArrowRight, GitCompare } from "lucide-react"
import { Bike } from "@/types/bike"
import { formatPrice, getSessionId } from "@/lib/utils"

interface WishlistItem {
  id: string
  bike_id: string
  notes: string | null
  bikes: Bike
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [localIds, setLocalIds] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("bg_wishlist")
    const ids: string[] = stored ? JSON.parse(stored) : []
    setLocalIds(ids)

    // Fetch from supabase
    fetch("/api/wishlist", {
      headers: { "x-session-id": getSessionId() },
    })
      .then((r) => r.json())
      .then(({ items: data }) => {
        setItems(data || [])
        setLoading(false)
      })
  }, [])

  async function removeFromWishlist(bikeId: string) {
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": getSessionId(),
      },
      body: JSON.stringify({ bike_id: bikeId }),
    })
    setItems((prev) => prev.filter((i) => i.bike_id !== bikeId))
    const next = localIds.filter((id) => id !== bikeId)
    setLocalIds(next)
    localStorage.setItem("bg_wishlist", JSON.stringify(next))
  }

  return (
    <div style={{ backgroundColor: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "var(--charcoal)", borderBottom: "3px solid var(--coral)" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1
            className="text-5xl md:text-7xl text-white"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            MY WISHLIST
            <span style={{ color: "var(--coral)" }}>.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>
            {loading ? "Loading..." : `${items.length} bikes saved`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse" style={{ backgroundColor: "#E8E3D8", border: "2px solid var(--border)" }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 retro-border bg-white max-w-md mx-auto">
            <Heart size={48} className="mx-auto mb-4" style={{ color: "var(--border)" }} />
            <p
              className="text-3xl"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              WISHLIST IS EMPTY
            </p>
            <p className="text-sm mt-2 mb-6" style={{ color: "var(--muted)" }}>
              Browse bikes and click the heart to save them here
            </p>
            <Link href="/bikes" className="retro-btn-coral px-6 py-3 inline-flex items-center gap-2 text-sm uppercase tracking-wider">
              Browse Bikes <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {items.map((item) => {
                const bike = item.bikes
                if (!bike) return null
                return (
                  <div key={item.id} className="bg-white retro-border relative">
                    <button
                      onClick={() => removeFromWishlist(item.bike_id)}
                      className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center retro-btn z-10"
                      style={{ backgroundColor: "var(--coral)", color: "white" }}
                    >
                      <X size={12} />
                    </button>

                    <div
                      className="w-full h-40 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: "var(--cream)" }}
                    >
                      {bike.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={bike.image_url} alt={bike.name} className="w-full h-full object-contain p-3" />
                      ) : (
                        <span className="text-6xl">🏍️</span>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                        {bike.brand} · {bike.category}
                      </p>
                      <p
                        className="text-2xl"
                        style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                      >
                        {bike.name}
                      </p>
                      <p
                        className="text-xl font-black mb-3"
                        style={{ fontFamily: "var(--font-bebas), sans-serif", color: "var(--coral)" }}
                      >
                        {formatPrice(bike.price_on_road)}
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                        <div style={{ borderRight: "1px solid var(--border)" }}>
                          <p className="font-black">{bike.engine_cc}cc</p>
                          <p style={{ color: "var(--muted)" }}>Engine</p>
                        </div>
                        <div style={{ borderRight: "1px solid var(--border)" }}>
                          <p className="font-black">{bike.mileage_kmpl}</p>
                          <p style={{ color: "var(--muted)" }}>kmpl</p>
                        </div>
                        <div>
                          <p className="font-black">{bike.rating}</p>
                          <p style={{ color: "var(--muted)" }}>Rating</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/bikes/${bike.id}`}
                          className="retro-btn flex-1 text-center py-2 text-xs uppercase tracking-wider"
                          style={{ backgroundColor: "white" }}
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/compare?ids=${bike.id}`}
                          className="retro-btn-coral px-3 py-2 flex items-center justify-center"
                        >
                          <GitCompare size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Compare all */}
            {items.length >= 2 && (
              <div
                className="p-6 bg-white retro-border text-center"
              >
                <p
                  className="text-2xl mb-2"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  COMPARE YOUR WISHLIST
                </p>
                <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                  Compare your saved bikes side-by-side
                </p>
                <Link
                  href={`/compare?ids=${items.slice(0, 3).map((i) => i.bike_id).join(",")}`}
                  className="retro-btn-coral px-8 py-3 inline-flex items-center gap-2 uppercase tracking-wider"
                >
                  <GitCompare size={16} />
                  Compare Top {Math.min(3, items.length)} Bikes
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
