"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Loader2, Check, X, Plus, ExternalLink, Search } from "lucide-react"
import Link from "next/link"

interface AutocompleteResult {
  displayName: string
  payload: { url: string; makeName: string; modelName: string }
}

interface BikeData {
  name: string
  brand: string
  model_year: number
  price_on_road: number
  price_ex_showroom: number
  category: string
  engine_cc: number
  max_power: string
  max_torque: string
  fuel_type: string
  mileage_kmpl: number
  top_speed: number
  abs: number
  weight_kg: number
  fuel_tank_liters: number
  seat_height_mm: number
  ground_clearance_mm: number
  colors: string[]
  pros: string[]
  cons: string[]
  image_url: string
  features: string[]
  suitable_for: string[]
  rating: number
  review_count: number
}

interface ScrapeResult {
  bike: BikeData
  raw?: string
  error?: string
}

const QUICK_LINKS = [
  { label: "Xpulse 210", url: "https://www.bikewale.com/hero-bikes/xpulse-210/" },
  { label: "NX200", url: "https://www.bikewale.com/honda-bikes/nx200/" },
  { label: "CB350 H'ness", url: "https://www.bikewale.com/honda-bikes/cb350/" },
  { label: "CB350RS", url: "https://www.bikewale.com/honda-bikes/cb350-rs/" },
  { label: "Pulsar N160", url: "https://www.bikewale.com/bajaj-bikes/pulsar-n160/" },
  { label: "Apache RTR 310", url: "https://www.bikewale.com/tvs-bikes/apache-rtr-310/" },
  { label: "Duke 390", url: "https://www.bikewale.com/ktm-bikes/duke-390/" },
  { label: "Classic 350", url: "https://www.bikewale.com/royalenfield-bikes/classic-350/" },
  { label: "Interceptor 650", url: "https://www.bikewale.com/royalenfield-bikes/interceptor-650/" },
  { label: "Scrambler 411", url: "https://www.bikewale.com/yezdi-bikes/scrambler/" },
  { label: "Himalayan 450", url: "https://www.bikewale.com/royalenfield-bikes/himalayan-450/" },
]

function SpecRow({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) return null
  const display = Array.isArray(value) ? value.join(", ") : String(value)
  return (
    <div className="flex gap-2 py-1.5 text-sm" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="w-44 flex-shrink-0 font-bold uppercase text-xs tracking-wider" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <span className="flex-1 font-medium break-all">{display}</span>
    </div>
  )
}

export default function AdminPage() {
  const [url, setUrl] = useState("")
  const [searchText, setSearchText] = useState("")
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScrapeResult | null>(null)
  const [editedBike, setEditedBike] = useState<BikeData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<{ action: string; id: string } | null>(null)
  const [queue, setQueue] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return }
    try {
      const res = await fetch(
        `https://www.bikewale.com/api/v4/autocomplete/?source=1%2C2%2C3%2C5%2C11%2C15%2C13%2C14%2C10%2C16%2C17%2C4%2C8%2C9%2C6%2C19%2C20%2C21%2C24%2C7%2C34&value=${encodeURIComponent(q)}&size=8&applicationId=2&showNoResult=true&cityId=-1`
      )
      const data: AutocompleteResult[] = await res.json()
      setSuggestions(data.filter(d => d.payload?.url))
      setSuggestionsOpen(true)
    } catch { setSuggestions([]) }
  }, [])

  function onSearchChange(val: string) {
    setSearchText(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 280)
  }

  function pickSuggestion(s: AutocompleteResult) {
    const fullUrl = `https://www.bikewale.com${s.payload.url}`
    setSearchText(s.displayName)
    setUrl(fullUrl)
    setSuggestionsOpen(false)
    scrape(fullUrl)
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSuggestionsOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  async function scrape(targetUrl?: string) {
    const u = targetUrl || url.trim()
    if (!u) return
    setLoading(true)
    setResult(null)
    setSaved(null)
    setEditedBike(null)

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      })
      const data = await res.json()
      setResult(data)
      if (data.bike) setEditedBike(data.bike)
    } catch (e) {
      setResult({ error: String(e), bike: null as unknown as BikeData })
    } finally {
      setLoading(false)
    }
  }

  async function saveBike() {
    if (!editedBike) return
    setSaving(true)
    // Strip internal fields before saving
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _price_breakdown, ...bikeToSave } = editedBike as BikeData & { _price_breakdown?: unknown }
    try {
      const res = await fetch("/api/scrape", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bike: bikeToSave }),
      })
      const data = await res.json()
      if (data.error) {
        alert("Save error: " + data.error)
      } else {
        setSaved(data)
        // Process next in queue
        if (queue.length > 0) {
          const [next, ...rest] = queue
          setQueue(rest)
          setUrl(next)
          await scrape(next)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  function calcBangaloreOnRoad(ex: number, cc: number) {
    if (!ex) return 0
    const taxRate = cc <= 150 ? 0.13 : 0.14
    const insurance = cc <= 150 ? 8000 : cc <= 350 ? 12000 : 15000
    return Math.round((ex + ex * taxRate + insurance + 3500) / 100) * 100
  }

  function updateField(key: keyof BikeData, val: unknown) {
    if (!editedBike) return
    const updated = { ...editedBike, [key]: val }
    // Auto-recalculate on-road when ex-showroom or cc changes
    if (key === "price_ex_showroom" || key === "engine_cc") {
      const ex = Number(key === "price_ex_showroom" ? val : updated.price_ex_showroom) || 0
      const cc = Number(key === "engine_cc" ? val : updated.engine_cc) || 150
      updated.price_on_road = calcBangaloreOnRoad(ex, cc)
    }
    setEditedBike(updated)
  }

  function addToQueue(u: string) {
    if (!queue.includes(u)) setQueue((q) => [...q, u])
  }

  return (
    <div style={{ backgroundColor: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "var(--charcoal)", borderBottom: "3px solid var(--coral)" }}>
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1
              className="text-4xl text-white"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              BIKE<span style={{ color: "var(--coral)" }}>GURU</span> ADMIN
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
              Paste any BikeWale URL → GPT extracts specs → Review → Save to DB
            </p>
          </div>
          <Link
            href="/bikes"
            className="retro-btn px-4 py-2 text-sm uppercase tracking-wider flex items-center gap-2"
            style={{ backgroundColor: "transparent", color: "white", borderColor: "white", boxShadow: "3px 3px 0 white" }}
          >
            ← Back to App
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[1fr_320px] gap-8">
          {/* Left: main scraper */}
          <div>
            {/* Search + autocomplete */}
            <div className="bg-white retro-border p-6 mb-6">
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
                Search any bike on BikeWale
              </p>
              <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                Type a bike name — select from live suggestions, or paste a URL directly below
              </p>

              {/* Live search with autocomplete */}
              <div ref={searchRef} className="relative mb-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => onSearchChange(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
                      placeholder="e.g. Xpulse 210, Apache RTR 310, CB350..."
                      className="w-full pl-9 pr-4 py-2.5 text-sm font-medium"
                      style={{ border: "2px solid var(--charcoal)", outline: "none" }}
                    />
                  </div>
                  <button
                    onClick={() => scrape()}
                    disabled={loading || !url.trim()}
                    className="retro-btn-coral px-4 py-2.5 text-sm uppercase tracking-wider flex items-center gap-2 disabled:opacity-40 flex-shrink-0"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : "Scrape →"}
                  </button>
                </div>

                {/* Dropdown suggestions */}
                {suggestionsOpen && suggestions.length > 0 && (
                  <div
                    className="absolute left-0 right-0 z-50 overflow-hidden"
                    style={{
                      top: "calc(100% + 4px)",
                      backgroundColor: "white",
                      border: "2px solid var(--charcoal)",
                      boxShadow: "4px 4px 0 var(--charcoal)",
                    }}
                  >
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onMouseDown={() => pickSuggestion(s)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                        style={{ borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--cream)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                      >
                        <span
                          className="flex-shrink-0 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5"
                          style={{ backgroundColor: "var(--charcoal)", color: "white" }}
                        >
                          {s.payload.makeName}
                        </span>
                        <span className="text-sm font-bold flex-1">{s.payload.modelName}</span>
                        <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                          bikewale.com{s.payload.url}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct URL input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && scrape()}
                  placeholder="Or paste URL: https://www.bikewale.com/hero-bikes/xpulse-210/"
                  className="flex-1 px-3 py-2 text-xs"
                  style={{ border: "1.5px solid var(--border)", outline: "none", color: "var(--muted)" }}
                />
              </div>

              {/* Quick links */}
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
                  Quick Scrape
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_LINKS.map((l) => (
                    <button
                      key={l.url}
                      onClick={() => { setSearchText(l.label); setUrl(l.url); scrape(l.url) }}
                      className="tag-pill text-xs hover:bg-gray-100 transition-colors"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="bg-white retro-border p-8 flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin" style={{ color: "var(--coral)" }} />
                <p className="font-bold uppercase tracking-wider text-sm">
                  Fetching page → Extracting with GPT-4o-mini...
                </p>
              </div>
            )}

            {/* Error */}
            {result?.error && (
              <div
                className="p-4 mb-4 flex items-start gap-3"
                style={{ border: "2px solid var(--coral)", backgroundColor: "#FFF5F5" }}
              >
                <X size={18} style={{ color: "var(--coral)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="font-black text-sm uppercase">Error</p>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{result.error}</p>
                </div>
              </div>
            )}

            {/* Extracted data preview + edit */}
            {editedBike && !loading && (
              <div className="bg-white retro-border">
                {/* Header */}
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ backgroundColor: "#F0EBE0", borderBottom: "2px solid var(--charcoal)" }}
                >
                  <div className="flex items-center gap-3">
                    {editedBike.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={editedBike.image_url}
                        alt={editedBike.name}
                        className="w-20 h-14 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                      />
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>
                        {editedBike.brand}
                      </p>
                      <p
                        className="text-3xl"
                        style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                      >
                        {editedBike.name}
                      </p>
                      <p className="text-xs font-bold" style={{ color: "var(--coral)" }}>
                        {editedBike.category} · ₹{Number(editedBike.price_on_road).toLocaleString("en-IN")} on-road (Bangalore)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {saved ? (
                      <div
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase"
                        style={{ backgroundColor: "#4CAF50", color: "white" }}
                      >
                        <Check size={14} />
                        {saved.action === "updated" ? "Updated!" : "Saved!"}
                      </div>
                    ) : (
                      <button
                        onClick={saveBike}
                        disabled={saving}
                        className="retro-btn-coral px-5 py-2 text-sm uppercase tracking-wider flex items-center gap-2 disabled:opacity-40"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Save to DB
                      </button>
                    )}
                  </div>
                </div>

                {/* Bangalore price breakdown */}
                {(editedBike as BikeData & { _price_breakdown?: Record<string, unknown> })._price_breakdown && (
                  <div
                    className="mx-6 mt-4 p-4"
                    style={{ backgroundColor: "#F0FFF4", border: "2px solid #4CAF50" }}
                  >
                    <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#4CAF50" }}>
                      Bangalore On-Road Breakdown (Karnataka)
                    </p>
                    {Object.entries(
                      (editedBike as BikeData & { _price_breakdown: Record<string, unknown> })._price_breakdown
                    ).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs py-0.5">
                        <span className="uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                          {k.replace(/_/g, " ")}
                        </span>
                        <span className="font-bold">
                          {typeof v === "number" && k !== "road_tax_rate" && !k.includes("rate")
                            ? `₹${Number(v).toLocaleString("en-IN")}`
                            : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Editable fields */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {(
                      [
                        ["name", "Name"],
                        ["brand", "Brand"],
                        ["model_year", "Year"],
                        ["price_on_road", "On-Road Price ₹ (Bangalore, auto-calc)"],
                        ["price_ex_showroom", "Ex-Showroom ₹ (edit to recalc)"],
                        ["category", "Category"],
                        ["engine_cc", "Engine CC"],
                        ["max_power", "Max Power"],
                        ["max_torque", "Max Torque"],
                        ["mileage_kmpl", "Mileage (kmpl)"],
                        ["top_speed", "Top Speed (km/h)"],
                        ["weight_kg", "Weight (kg)"],
                        ["fuel_tank_liters", "Tank (L)"],
                        ["seat_height_mm", "Seat Height (mm)"],
                        ["ground_clearance_mm", "Ground Clearance (mm)"],
                        ["abs", "ABS (0=none, 1=single, 2=dual)"],
                        ["rating", "Rating (0-5)"],
                        ["review_count", "Review Count"],
                      ] as [keyof BikeData, string][]
                    ).map(([key, label]) => (
                      <div key={key}>
                        <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--muted)" }}>
                          {label}
                        </label>
                        <input
                          type={typeof editedBike[key] === "number" ? "number" : "text"}
                          value={editedBike[key] as string | number ?? ""}
                          onChange={(e) =>
                            updateField(
                              key,
                              typeof editedBike[key] === "number"
                                ? Number(e.target.value)
                                : e.target.value
                            )
                          }
                          className="w-full px-3 py-1.5 text-sm"
                          style={{ border: "1.5px solid var(--border)", outline: "none" }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Arrays */}
                  {(
                    [
                      ["colors", "Colors (comma-separated)"],
                      ["features", "Features (comma-separated)"],
                      ["pros", "Pros (comma-separated)"],
                      ["cons", "Cons (comma-separated)"],
                      ["suitable_for", "Suitable For (commute,city,highway,sport,touring)"],
                    ] as [keyof BikeData, string][]
                  ).map(([key, label]) => (
                    <div key={key} className="mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--muted)" }}>
                        {label}
                      </label>
                      <input
                        type="text"
                        value={Array.isArray(editedBike[key]) ? (editedBike[key] as string[]).join(", ") : ""}
                        onChange={(e) =>
                          updateField(
                            key,
                            e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                          )
                        }
                        className="w-full px-3 py-1.5 text-sm"
                        style={{ border: "1.5px solid var(--border)", outline: "none" }}
                      />
                    </div>
                  ))}

                  {/* Image URL */}
                  <div className="mt-3">
                    <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--muted)" }}>
                      Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editedBike.image_url ?? ""}
                        onChange={(e) => updateField("image_url", e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm"
                        style={{ border: "1.5px solid var(--border)", outline: "none" }}
                      />
                      {editedBike.image_url && (
                        <a
                          href={editedBike.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="retro-btn px-3 py-1.5 flex items-center gap-1 text-xs"
                          style={{ backgroundColor: "white" }}
                        >
                          <ExternalLink size={12} /> Test
                        </a>
                      )}
                    </div>
                    {editedBike.image_url && (
                      <div className="mt-2 flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editedBike.image_url}
                          alt="preview"
                          className="h-20 object-contain border"
                          style={{ borderColor: "var(--border)" }}
                          onError={(e) => { (e.target as HTMLImageElement).alt = "Image failed to load" }}
                        />
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                          If image doesn't show, paste a different URL above
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: queue + instructions */}
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-white retro-border p-4">
              <p
                className="text-lg mb-3"
                style={{ fontFamily: "var(--font-bebas), sans-serif" }}
              >
                HOW IT WORKS
              </p>
              <ol className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
                <li className="flex gap-2"><span className="font-black text-coral" style={{ color: "var(--coral)" }}>1.</span> Paste any BikeWale bike URL</li>
                <li className="flex gap-2"><span className="font-black" style={{ color: "var(--coral)" }}>2.</span> GPT-4o-mini extracts all specs</li>
                <li className="flex gap-2"><span className="font-black" style={{ color: "var(--coral)" }}>3.</span> Review & edit the extracted data</li>
                <li className="flex gap-2"><span className="font-black" style={{ color: "var(--coral)" }}>4.</span> Click "Save to DB" — done!</li>
              </ol>
              <p className="text-xs mt-3 pt-3" style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
                Works with any bike on bikewale.com. Auto-detects if bike already exists and updates instead of duplicating.
              </p>
            </div>

            {/* Queue */}
            <div className="bg-white retro-border p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>
                  BATCH QUEUE
                </p>
                {queue.length > 0 && (
                  <button
                    onClick={() => { const [first, ...rest] = queue; setQueue(rest); setUrl(first); scrape(first) }}
                    className="retro-btn-coral text-xs px-3 py-1 uppercase tracking-wider"
                  >
                    Scrape Next
                  </button>
                )}
              </div>

              <div className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                Add multiple URLs to scrape one by one
              </div>

              {queue.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: "var(--border)" }}>Queue empty</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {queue.map((u, i) => (
                    <div key={u} className="flex items-center gap-2 text-xs p-2" style={{ backgroundColor: "var(--cream)" }}>
                      <span className="font-bold w-4">{i + 1}</span>
                      <span className="flex-1 truncate" style={{ color: "var(--muted)" }}>
                        {u.replace("https://www.bikewale.com/", "")}
                      </span>
                      <button onClick={() => setQueue(queue.filter((x) => x !== u))}>
                        <X size={10} style={{ color: "var(--coral)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <input
                  type="url"
                  placeholder="bikewale.com/..."
                  className="flex-1 px-2 py-1.5 text-xs"
                  style={{ border: "1.5px solid var(--border)", outline: "none" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim()
                      if (val) { addToQueue(val); (e.target as HTMLInputElement).value = "" }
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement)
                    if (input.value.trim()) { addToQueue(input.value.trim()); input.value = "" }
                  }}
                  className="retro-btn px-3 py-1.5 text-xs"
                  style={{ backgroundColor: "white" }}
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Bulk quick-add */}
            <div className="bg-white retro-border p-4">
              <p className="text-sm font-black uppercase tracking-wider mb-2">Popular Bikes to Add</p>
              <div className="space-y-1">
                {QUICK_LINKS.map((l) => (
                  <button
                    key={l.url}
                    onClick={() => addToQueue(l.url)}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-gray-50"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <Plus size={10} style={{ color: "var(--coral)" }} />
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
