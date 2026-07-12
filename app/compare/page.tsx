"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { X, Plus, Check, Share2, Save, Loader2, BookmarkCheck, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Bike } from "@/types/bike"
import { formatPrice } from "@/lib/utils"
import ShareModal from "@/components/ui/ShareModal"
import AICompare from "@/components/bikes/AICompare"

const COMPARE_ROWS = [
  { key: "price_on_road", label: "On-Road (Bangalore)", format: (v: number) => formatPrice(v), better: "lower" },
  { key: "price_ex_showroom", label: "Ex-Showroom", format: (v: number) => formatPrice(v), better: "lower" },
  { key: "engine_cc", label: "Engine", format: (v: number) => `${v}cc`, better: "higher" },
  { key: "max_power", label: "Max Power", format: (v: unknown) => String(v), better: "none" },
  { key: "max_torque", label: "Max Torque", format: (v: unknown) => String(v), better: "none" },
  { key: "mileage_kmpl", label: "Mileage", format: (v: number) => `${v} kmpl`, better: "higher" },
  { key: "top_speed", label: "Top Speed", format: (v: number) => `${v} km/h`, better: "higher" },
  { key: "weight_kg", label: "Weight", format: (v: number) => `${v} kg`, better: "lower" },
  { key: "fuel_tank_liters", label: "Fuel Tank", format: (v: number) => `${v} L`, better: "higher" },
  { key: "seat_height_mm", label: "Seat Height", format: (v: number) => `${v} mm`, better: "none" },
  { key: "ground_clearance_mm", label: "Ground Clearance", format: (v: number) => `${v} mm`, better: "higher" },
  { key: "abs", label: "ABS", format: (v: number) => v === 2 ? "Dual Channel" : v === 1 ? "Single" : "None", better: "none" },
  { key: "rating", label: "User Rating", format: (v: number) => `${v} / 5`, better: "higher" },
]

function CompareContent() {
  const searchParams = useSearchParams()
  const [bikes, setBikes] = useState<(Bike | null)[]>([null, null, null])
  const [allBikes, setAllBikes] = useState<Bike[]>([])
  const [loading, setLoading] = useState(true)
  const [picking, setPicking] = useState<number | null>(null)
  const [pickSearch, setPickSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [showNameInput, setShowNameInput] = useState(false)

  useEffect(() => {
    async function load() {
      const { bikes: all } = await fetch("/api/bikes").then(r => r.json())
      setAllBikes(all || [])

      const loaded: (Bike | null)[] = [null, null, null]

      // Load from saved comparison
      const savedParam = searchParams.get("saved")
      if (savedParam) {
        const { comparison } = await fetch(`/api/compare?id=${savedParam}`).then(r => r.json()).catch(() => ({}))
        if (comparison?.bike_ids) {
          comparison.bike_ids.slice(0, 3).forEach((id: string, i: number) => {
            const found = all?.find((b: Bike) => b.id === id)
            if (found) loaded[i] = found
          })
          setSavedId(savedParam)
        }
      } else {
        // Load from URL ids param
        const idsParam = searchParams.get("ids")
        const ids = idsParam ? idsParam.split(",").slice(0, 3) : []
        ids.forEach((id, i) => {
          const found = all?.find((b: Bike) => b.id === id)
          if (found) loaded[i] = found
        })
      }

      setBikes(loaded)
      setLoading(false)
    }
    load()
  }, [searchParams])

  const [dupWarning, setDupWarning] = useState("")

  function selectBike(slot: number, bike: Bike) {
    // Prevent duplicate bikes in other slots
    const alreadyInOtherSlot = bikes.some((b, i) => i !== slot && b?.id === bike.id)
    if (alreadyInOtherSlot) {
      setDupWarning(`${bike.name} is already in this comparison!`)
      setTimeout(() => setDupWarning(""), 3000)
      return
    }
    setBikes(prev => { const n = [...prev]; n[slot] = bike; return n })
    setPicking(null)
    setPickSearch("")
    setDupWarning("")
  }

  function removeBike(slot: number) {
    setBikes(prev => { const n = [...prev]; n[slot] = null; return n })
  }

  async function saveComparison() {
    const activeBikes = bikes.filter(Boolean) as Bike[]
    if (activeBikes.length < 2) return
    setSaving(true)
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bike_ids: activeBikes.map(b => b.id),
          name: saveName || activeBikes.map(b => b.name).join(" vs "),
        }),
      })
      const { id } = await res.json()
      setSavedId(id)
      setShowNameInput(false)
      // Update URL without reload
      window.history.replaceState({}, "", `/compare?saved=${id}`)
    } finally {
      setSaving(false)
    }
  }

  const activeBikes = bikes.filter(Boolean) as Bike[]

  function getBestIdx(key: string, direction: string): number {
    if (direction === "none" || activeBikes.length < 2) return -1
    const vals = activeBikes.map(b => Number((b as unknown as Record<string, unknown>)[key]) || 0)
    return direction === "higher" ? vals.indexOf(Math.max(...vals)) : vals.indexOf(Math.min(...vals))
  }

  const filteredBikes = allBikes.filter(b => {
    // Only exclude bikes already in OTHER slots (not the slot being replaced)
    if (picking !== null && bikes.some((s, i) => i !== picking && s?.id === b.id)) return false
    if (!pickSearch.trim()) return true
    return b.name.toLowerCase().includes(pickSearch.toLowerCase()) ||
      b.brand.toLowerCase().includes(pickSearch.toLowerCase())
  })

  if (loading) return (
    <div className="flex items-center justify-center min-h-64 py-20">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--coral)" }} />
        <p style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20 }}>LOADING...</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Duplicate warning toast */}
      {dupWarning && (
        <div className="flex items-center gap-2 mb-3 px-4 py-3 text-sm font-bold" style={{ backgroundColor: "#FFF3CD", border: "2px solid var(--amber)", color: "var(--charcoal)" }}>
          <AlertCircle size={16} style={{ color: "var(--amber)", flexShrink: 0 }} />
          {dupWarning}
        </div>
      )}

      {/* Save / Share bar */}
      {activeBikes.length >= 2 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {savedId ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-black uppercase" style={{ backgroundColor: "#4CAF50", color: "white" }}>
                <BookmarkCheck size={14} /> Saved
              </div>
              <button
                onClick={() => setShareOpen(true)}
                className="retro-btn-coral px-4 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <Share2 size={14} /> Share Comparison
              </button>
            </>
          ) : showNameInput ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder={activeBikes.map(b => b.name).join(" vs ")}
                className="flex-1 px-3 py-1.5 text-sm min-w-0"
                style={{ border: "2px solid var(--charcoal)", outline: "none" }}
                autoFocus
                onKeyDown={e => e.key === "Enter" && saveComparison()}
              />
              <button onClick={saveComparison} disabled={saving} className="retro-btn-coral px-4 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
              </button>
              <button onClick={() => setShowNameInput(false)} style={{ color: "var(--muted)" }}><X size={16} /></button>
            </div>
          ) : (
            <button
              onClick={() => setShowNameInput(true)}
              className="retro-btn px-4 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5"
              style={{ backgroundColor: "white" }}
            >
              <Save size={14} /> Save Comparison
            </button>
          )}
        </div>
      )}

      {/* Bike slots — horizontal scroll on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
        {bikes.map((bike, slot) => (
          <div key={slot}>
            {bike ? (
              <div className="retro-border bg-white relative">
                <button onClick={() => removeBike(slot)} className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center retro-btn z-10" style={{ backgroundColor: "var(--coral)", color: "white" }}>
                  <X size={10} />
                </button>
                <div className="h-20 sm:h-28 flex items-center justify-center overflow-hidden p-1" style={{ backgroundColor: "var(--cream)" }}>
                  {bike.image_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={bike.image_url} alt={bike.name} className="w-full h-full object-contain" />
                    : <span className="text-4xl">🏍️</span>
                  }
                </div>
                <div className="p-2 sm:p-3">
                  <p className="text-[10px] font-bold uppercase leading-none" style={{ color: "var(--muted)" }}>{bike.brand}</p>
                  <p className="font-black leading-tight text-sm sm:text-base" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>{bike.name}</p>
                  <p className="font-black text-sm sm:text-xl leading-none mt-0.5" style={{ fontFamily: "var(--font-bebas), sans-serif", color: "var(--coral)" }}>
                    {formatPrice(bike.price_on_road)}
                  </p>
                </div>
              </div>
            ) : (
              <button onClick={() => setPicking(slot)} className="w-full h-full retro-border bg-white flex flex-col items-center justify-center gap-2 card-hover press-active" style={{ minHeight: 120 }}>
                <Plus size={20} style={{ color: "var(--coral)" }} />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider" style={{ color: "var(--muted)" }}>Add Bike</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bike picker — bottom sheet on mobile, centered modal on desktop */}
      {picking !== null && (
        <>
          {/* Backdrop — always covers everything */}
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => { setPicking(null); setPickSearch("") }} />

          {/* Panel */}
          <div
            className="fixed z-[61] bg-white flex flex-col"
            style={{
              /* Mobile: full-width bottom sheet */
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "80vh",
              border: "3px solid var(--charcoal)",
              borderBottom: "none",
              boxShadow: "0 -4px 0 var(--coral)",
            }}
          >
            <div className="flex items-center justify-between p-3 flex-shrink-0" style={{ borderBottom: "2px solid var(--charcoal)", backgroundColor: "var(--charcoal)" }}>
              <p className="font-black text-white uppercase text-sm tracking-wider">Select Bike for Slot {picking + 1}</p>
              <button onClick={() => { setPicking(null); setPickSearch("") }} style={{ color: "rgba(255,255,255,0.6)" }}><X size={18} /></button>
            </div>
            <div className="p-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
              <input
                autoFocus
                value={pickSearch}
                onChange={e => setPickSearch(e.target.value)}
                placeholder="Search bikes..."
                className="w-full px-3 py-2 text-sm"
                style={{ border: "2px solid var(--charcoal)", outline: "none" }}
              />
            </div>
            <div className="overflow-y-auto flex-1 p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredBikes.map(b => (
                <button key={b.id} onClick={() => selectBike(picking, b)}
                  className="retro-btn text-left flex flex-col overflow-hidden press-active"
                  style={{ backgroundColor: "white" }}
                >
                  {/* Thumbnail */}
                  <div className="w-full flex items-center justify-center" style={{ height: 64, backgroundColor: "var(--cream)" }}>
                    {b.image_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={b.image_url} alt={b.name} className="w-full h-full object-contain p-1.5" />
                      : <span className="text-2xl">🏍️</span>
                    }
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] uppercase font-bold leading-none" style={{ color: "var(--muted)" }}>{b.brand}</p>
                    <p className="font-black text-xs leading-tight mt-0.5">{b.name}</p>
                    <p className="font-black text-xs mt-0.5" style={{ color: "var(--coral)", fontFamily: "var(--font-bebas), sans-serif", fontSize: 13 }}>{formatPrice(b.price_on_road)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Comparison table */}
      {activeBikes.length >= 2 ? (
        <div className="bg-white retro-border overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "var(--charcoal)" }}>
            <p className="text-xl text-white" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>FULL COMPARISON</p>
            <button onClick={() => setShareOpen(true)} className="flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5" style={{ backgroundColor: "var(--coral)", color: "white" }}>
              <Share2 size={12} /> Share
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 340 }}>
              <tbody>
                {COMPARE_ROWS.map((row, ri) => {
                  const bestIdx = getBestIdx(row.key, row.better)
                  return (
                    <tr key={row.key} style={{ borderBottom: "1px solid var(--border)", backgroundColor: ri % 2 === 0 ? "white" : "var(--cream)" }}>
                      <td className="px-3 py-2.5 text-[11px] font-black uppercase tracking-wider w-28 sm:w-36 flex-shrink-0" style={{ color: "var(--muted)" }}>
                        {row.label}
                      </td>
                      {activeBikes.map((bike, bi) => {
                        const val = (bike as unknown as Record<string, unknown>)[row.key]
                        const isBest = bestIdx === bi
                        return (
                          <td key={bike.id} className="px-3 py-2.5 text-xs sm:text-sm font-bold text-center" style={{ backgroundColor: isBest ? "rgba(76,175,80,0.1)" : undefined, color: isBest ? "#4CAF50" : "var(--charcoal)" }}>
                            {row.format(val as number)}
                            {isBest && <Check size={10} className="inline ml-1" style={{ color: "#4CAF50" }} />}
                          </td>
                        )
                      })}
                      {activeBikes.length < 3 && <td className="px-3 py-2.5 text-center text-xs" style={{ color: "var(--border)" }}>—</td>}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pros/cons per bike */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0" style={{ borderTop: "2px solid var(--charcoal)" }}>
            {activeBikes.map((bike, i) => (
              <div key={bike.id} className="p-4" style={{ borderRight: i < activeBikes.length - 1 ? "1px solid var(--border)" : "none" }}>
                <p className="font-black text-sm uppercase mb-2" style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 16 }}>{bike.name}</p>
                {bike.pros?.slice(0, 3).map(p => (
                  <div key={p} className="flex gap-1.5 items-start mb-1 text-xs">
                    <Check size={11} className="flex-shrink-0 mt-0.5" style={{ color: "#4CAF50" }} />
                    <span>{p}</span>
                  </div>
                ))}
                {bike.cons?.slice(0, 2).map(c => (
                  <div key={c} className="flex gap-1.5 items-start mb-1 text-xs">
                    <X size={11} className="flex-shrink-0 mt-0.5" style={{ color: "var(--coral)" }} />
                    <span style={{ color: "var(--muted)" }}>{c}</span>
                  </div>
                ))}
                <Link href={`/bikes/${bike.id}`} className="inline-block mt-2 text-[10px] font-black uppercase tracking-wider px-2 py-1" style={{ border: "1.5px solid var(--charcoal)", backgroundColor: "var(--cream)" }}>
                  Full Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 retro-border bg-white">
          <div className="text-5xl mb-4">⚡</div>
          <p className="text-3xl" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>SELECT AT LEAST 2 BIKES</p>
          <p className="text-sm mt-2 mb-6" style={{ color: "var(--muted)" }}>Tap the + slots above to add bikes</p>
          <Link href="/bikes" className="retro-btn-coral px-6 py-3 inline-block text-sm uppercase tracking-wider">Browse All Bikes →</Link>
        </div>
      )}

      {/* AI Compare — only shown when 2+ bikes selected */}
      <AICompare bikes={bikes} />

      {/* Share modal */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={activeBikes.map(b => b.name).join(" vs ")}
        url={savedId ? `/compare?saved=${savedId}` : `/compare?ids=${activeBikes.map(b => b.id).join(",")}`}
        description={`Bangalore on-road prices compared — ${activeBikes.map(b => formatPrice(b.price_on_road)).join(" / ")}`}
      />
    </div>
  )
}

export default function ComparePage() {
  return (
    <div style={{ backgroundColor: "var(--cream)", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "var(--charcoal)", borderBottom: "3px solid var(--coral)" }}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <h1 className="text-5xl sm:text-7xl text-white" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>
            COMPARE BIKES<span style={{ color: "var(--coral)" }}>.</span>
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Side-by-side · Save · Share</p>
        </div>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center min-h-64"><Loader2 size={32} className="animate-spin" style={{ color: "var(--coral)" }} /></div>}>
        <CompareContent />
      </Suspense>
    </div>
  )
}
