"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { GitCompare, Share2, Trash2, Plus, Loader2, BookmarkCheck, ArrowRight } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import ShareModal from "@/components/ui/ShareModal"

interface BikePreview {
  id: string
  name: string
  brand: string
  image_url: string | null
  price_on_road: number
  engine_cc: number
  category: string
}

interface SavedComparison {
  id: string
  name: string
  bike_ids: string[]
  created_at: string
  bikes: BikePreview[]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function ComparisonsPage() {
  const [comparisons, setComparisons] = useState<SavedComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [shareTarget, setShareTarget] = useState<SavedComparison | null>(null)

  useEffect(() => {
    fetch("/api/compare")
      .then(r => r.json())
      .then(({ comparisons }) => {
        setComparisons(comparisons || [])
        setLoading(false)
      })
  }, [])

  async function deleteComparison(id: string) {
    setDeleting(id)
    await fetch("/api/compare", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setComparisons(prev => prev.filter(c => c.id !== id))
    setDeleting(null)
  }

  return (
    <div style={{ backgroundColor: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "var(--charcoal)", borderBottom: "3px solid var(--coral)" }}>
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                Your Saved
              </p>
              <h1 className="text-5xl sm:text-7xl text-white leading-none" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>
                COMPARISONS<span style={{ color: "var(--coral)" }}>.</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                {loading ? "Loading..." : `${comparisons.length} saved comparison${comparisons.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <Link
              href="/compare"
              className="retro-btn-coral px-4 py-2.5 text-sm uppercase tracking-wider flex items-center gap-2 flex-shrink-0"
            >
              <Plus size={16} /> New
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 200, border: "2px solid var(--border)" }} />
            ))}
          </div>
        ) : comparisons.length === 0 ? (
          <div className="retro-border bg-white text-center py-16 px-6">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-3xl sm:text-4xl mb-2" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>
              NO SAVED COMPARISONS
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              Go to the Compare page, pick 2–3 bikes, and hit Save to store them here.
            </p>
            <Link href="/compare" className="retro-btn-coral px-8 py-3 inline-flex items-center gap-2 text-sm uppercase tracking-wider">
              <GitCompare size={16} /> Start Comparing
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {comparisons.map(c => (
              <div key={c.id} className="bg-white retro-border flex flex-col">
                {/* Card header */}
                <div
                  className="px-4 py-3 flex items-center justify-between gap-2"
                  style={{ backgroundColor: "var(--charcoal)", borderBottom: "2px solid var(--coral)" }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BookmarkCheck size={14} style={{ color: "var(--coral)", flexShrink: 0 }} />
                    <p
                      className="text-base text-white font-black uppercase tracking-wide truncate"
                      style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.04em" }}
                    >
                      {c.name}
                    </p>
                  </div>
                  <span className="text-[10px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {timeAgo(c.created_at)}
                  </span>
                </div>

                {/* Bike previews */}
                <div className="flex-1 p-4">
                  <div className={`grid gap-3 ${c.bikes.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                    {c.bikes.map((bike, i) => (
                      <div key={bike.id} className="flex flex-col gap-1.5">
                        {/* Image */}
                        <div
                          className="relative flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: "var(--cream)", height: 72, border: "1.5px solid var(--border)" }}
                        >
                          {bike.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={bike.image_url} alt={bike.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-3xl">🏍️</span>
                          )}
                          {/* vs badge */}
                          {i < c.bikes.length - 1 && (
                            <span
                              className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[9px] font-black px-1 py-0.5"
                              style={{ backgroundColor: "var(--coral)", color: "white", border: "1px solid var(--charcoal)" }}
                            >
                              VS
                            </span>
                          )}
                        </div>
                        {/* Info */}
                        <div>
                          <p className="text-[9px] font-bold uppercase leading-none" style={{ color: "var(--muted)" }}>
                            {bike.brand}
                          </p>
                          <p className="text-xs font-black leading-tight" style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 13 }}>
                            {bike.name}
                          </p>
                          <p className="text-xs font-black" style={{ color: "var(--coral)", fontFamily: "var(--font-bebas), sans-serif" }}>
                            {formatPrice(bike.price_on_road)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ borderTop: "1.5px solid var(--border)" }}
                >
                  <Link
                    href={`/compare?saved=${c.id}`}
                    className="retro-btn-coral flex-1 py-2 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 press-active"
                  >
                    <GitCompare size={13} /> Open <ArrowRight size={11} />
                  </Link>
                  <button
                    onClick={() => setShareTarget(c)}
                    className="retro-btn px-3 py-2 flex items-center gap-1.5 text-xs uppercase tracking-wider press-active"
                    style={{ backgroundColor: "white" }}
                  >
                    <Share2 size={13} /> Share
                  </button>
                  <button
                    onClick={() => deleteComparison(c.id)}
                    disabled={deleting === c.id}
                    className="w-8 h-8 flex items-center justify-center retro-btn press-active disabled:opacity-40"
                    style={{ backgroundColor: "white", color: "var(--coral)" }}
                    title="Delete"
                  >
                    {deleting === c.id
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Trash2 size={13} />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tip */}
        {!loading && comparisons.length > 0 && (
          <div
            className="mt-6 p-4 flex items-start gap-3"
            style={{ border: "1.5px dashed var(--border)", backgroundColor: "white" }}
          >
            <span className="text-lg flex-shrink-0">💡</span>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Share links work for anyone — send to a friend, they'll see the same side-by-side comparison with Bangalore on-road prices.
            </p>
          </div>
        )}
      </div>

      {/* Share modal */}
      {shareTarget && (
        <ShareModal
          open={!!shareTarget}
          onClose={() => setShareTarget(null)}
          title={shareTarget.name}
          url={`/compare?saved=${shareTarget.id}`}
          description={`${shareTarget.bikes.map(b => b.name).join(" vs ")} — Bangalore on-road prices`}
        />
      )}
    </div>
  )
}
