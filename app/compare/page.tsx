"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { X, Plus, Check } from "lucide-react"
import Link from "next/link"
import { Bike } from "@/types/bike"
import { formatPrice } from "@/lib/utils"

const COMPARE_ROWS = [
  { key: "price_on_road", label: "On-Road Price", format: (v: number) => formatPrice(v), better: "lower" },
  { key: "engine_cc", label: "Engine (cc)", format: (v: number) => `${v}cc`, better: "higher" },
  { key: "mileage_kmpl", label: "Mileage", format: (v: number) => `${v} kmpl`, better: "higher" },
  { key: "top_speed", label: "Top Speed", format: (v: number) => `${v} km/h`, better: "higher" },
  { key: "weight_kg", label: "Weight", format: (v: number) => `${v} kg`, better: "lower" },
  { key: "fuel_tank_liters", label: "Fuel Tank", format: (v: number) => `${v} L`, better: "higher" },
  { key: "seat_height_mm", label: "Seat Height", format: (v: number) => `${v} mm`, better: "none" },
  { key: "ground_clearance_mm", label: "Ground Clearance", format: (v: number) => `${v} mm`, better: "higher" },
  { key: "abs", label: "ABS", format: (v: number) => v === 2 ? "Dual" : v === 1 ? "Single" : "None", better: "none" },
  { key: "rating", label: "Rating", format: (v: number) => `${v}/5`, better: "higher" },
]

function CompareContent() {
  const searchParams = useSearchParams()
  const [bikes, setBikes] = useState<(Bike | null)[]>([null, null, null])
  const [allBikes, setAllBikes] = useState<Bike[]>([])
  const [loading, setLoading] = useState(true)
  const [picking, setPicking] = useState<number | null>(null)

  useEffect(() => {
    const idsParam = searchParams.get("ids")
    const ids = idsParam ? idsParam.split(",").slice(0, 3) : []

    fetch("/api/bikes")
      .then((r) => r.json())
      .then(({ bikes: all }) => {
        setAllBikes(all || [])
        const loaded: (Bike | null)[] = [null, null, null]
        ids.forEach((id, i) => {
          const found = all?.find((b: Bike) => b.id === id)
          if (found) loaded[i] = found
        })
        setBikes(loaded)
        setLoading(false)
      })
  }, [searchParams])

  function selectBike(slot: number, bike: Bike) {
    setBikes((prev) => {
      const next = [...prev]
      next[slot] = bike
      return next
    })
    setPicking(null)
  }

  function removeBike(slot: number) {
    setBikes((prev) => {
      const next = [...prev]
      next[slot] = null
      return next
    })
  }

  const activeBikes = bikes.filter(Boolean) as Bike[]

  function getBestSlot(key: string, direction: string): number {
    if (direction === "none" || activeBikes.length < 2) return -1
    const values = activeBikes.map((b) => (b as unknown as Record<string, unknown>)[key] as number)
    if (direction === "higher") return values.indexOf(Math.max(...values))
    if (direction === "lower") return values.indexOf(Math.min(...values))
    return -1
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-2xl" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>
          LOADING COMPARE...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Slot selector */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {bikes.map((bike, slot) => (
          <div key={slot}>
            {bike ? (
              <div className="retro-border bg-white p-4 relative">
                <button
                  onClick={() => removeBike(slot)}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center retro-btn"
                  style={{ backgroundColor: "var(--coral)", color: "white" }}
                >
                  <X size={12} />
                </button>
                <div
                  className="w-full h-28 flex items-center justify-center mb-3 overflow-hidden"
                  style={{ backgroundColor: "var(--cream)" }}
                >
                  {bike.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bike.image_url} alt={bike.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-5xl">🏍️</span>
                  )}
                </div>
                <p className="text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>{bike.brand}</p>
                <p className="text-xl" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>{bike.name}</p>
                <p
                  className="text-2xl font-black"
                  style={{ fontFamily: "var(--font-bebas), sans-serif", color: "var(--coral)" }}
                >
                  {formatPrice(bike.price_on_road)}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setPicking(slot)}
                className="w-full retro-border bg-white p-4 flex flex-col items-center gap-2 text-sm font-bold uppercase tracking-wider card-hover"
                style={{ minHeight: 160, color: "var(--muted)" }}
              >
                <Plus size={24} style={{ color: "var(--coral)" }} />
                Add Bike
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bike picker */}
      {picking !== null && (
        <div className="mb-8 p-4 bg-white" style={{ border: "2px solid var(--charcoal)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-black uppercase tracking-wider">Select Bike for Slot {picking + 1}</p>
            <button onClick={() => setPicking(null)} style={{ color: "var(--muted)" }}>
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
            {allBikes
              .filter((b) => !bikes.some((selected) => selected?.id === b.id))
              .map((b) => (
                <button
                  key={b.id}
                  onClick={() => selectBike(picking, b)}
                  className="retro-btn p-3 text-left text-sm"
                  style={{ backgroundColor: "var(--cream)" }}
                >
                  <p className="text-xs uppercase" style={{ color: "var(--muted)" }}>{b.brand}</p>
                  <p className="font-black">{b.name}</p>
                  <p style={{ color: "var(--coral)", fontWeight: 700 }}>{formatPrice(b.price_on_road)}</p>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Comparison table */}
      {activeBikes.length >= 2 && (
        <div className="bg-white retro-border overflow-hidden">
          <div className="px-4 py-3" style={{ backgroundColor: "var(--charcoal)" }}>
            <p className="text-xl text-white" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>
              FULL COMPARISON
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <colgroup>
                <col className="w-40" />
                {activeBikes.map((_, i) => <col key={i} />)}
              </colgroup>
              <tbody>
                {COMPARE_ROWS.map((row, ri) => {
                  const bestSlot = getBestSlot(row.key, row.better)
                  return (
                    <tr
                      key={row.key}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        backgroundColor: ri % 2 === 0 ? "white" : "var(--cream)",
                      }}
                    >
                      <td
                        className="px-4 py-3 text-xs font-black uppercase tracking-wider"
                        style={{ color: "var(--muted)", minWidth: 140 }}
                      >
                        {row.label}
                      </td>
                      {activeBikes.map((bike, bi) => {
                        const val = (bike as unknown as Record<string, unknown>)[row.key]
                        const isBest = bestSlot === bi
                        return (
                          <td
                            key={bike.id}
                            className="px-4 py-3 text-sm font-bold text-center"
                            style={{
                              backgroundColor: isBest ? "rgba(76,175,80,0.1)" : undefined,
                              color: isBest ? "#4CAF50" : "var(--charcoal)",
                            }}
                          >
                            {row.format(val as number)}
                            {isBest && (
                              <Check size={12} className="inline ml-1" style={{ color: "#4CAF50" }} />
                            )}
                          </td>
                        )
                      })}
                      {activeBikes.length < 3 && (
                        <td className="px-4 py-3 text-center text-xs" style={{ color: "var(--border)" }}>—</td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeBikes.length < 2 && (
        <div className="text-center py-16 retro-border bg-white">
          <div style={{ fontSize: 60 }}>⚡</div>
          <p className="text-3xl mt-4" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>
            SELECT AT LEAST 2 BIKES
          </p>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
            Use the slots above to pick bikes to compare
          </p>
          <Link href="/bikes" className="retro-btn-coral px-6 py-3 inline-block mt-6 text-sm uppercase tracking-wider">
            Browse All Bikes →
          </Link>
        </div>
      )}
    </div>
  )
}

export default function ComparePage() {
  return (
    <div style={{ backgroundColor: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "var(--charcoal)", borderBottom: "3px solid var(--coral)" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1
            className="text-5xl md:text-7xl text-white"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            COMPARE BIKES
            <span style={{ color: "var(--coral)" }}>.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>Select up to 3 bikes to compare side-by-side</p>
        </div>
      </div>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-96">
          <p className="text-2xl" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>LOADING...</p>
        </div>
      }>
        <CompareContent />
      </Suspense>
    </div>
  )
}
