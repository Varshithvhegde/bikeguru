"use client"

import { useState } from "react"
import { Loader2, Sparkles, Trophy, TrendingUp, ChevronDown, ChevronUp, RotateCcw } from "lucide-react"
import { Bike } from "@/types/bike"
import { formatPrice } from "@/lib/utils"

interface Score { [bikeName: string]: number }

interface Category {
  name: string
  icon: string
  scores: Score
  insight: string
}

interface UseCase {
  use: string
  winner: string
  reason: string
}

interface BuyerPersona {
  persona: string
  recommendation: string
  reason: string
}

interface Report {
  verdict: {
    winner: string
    tagline: string
    runner_up: string | null
    best_value: string
    best_for_highway: string
    best_for_city: string
    best_mileage: string
  }
  summary: string
  categories: Category[]
  use_cases: UseCase[]
  key_differences: string[]
  buyer_personas: BuyerPersona[]
}

/* ── Radial score ring ── */
function ScoreRing({ score, color, size = 64 }: { score: number; color: string; size?: number }) {
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text
        x={size / 2} y={size / 2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        style={{ transform: "rotate(90deg)", transformOrigin: `${size / 2}px ${size / 2}px`, fontSize: size * 0.22, fontWeight: 800, fill: color, fontFamily: "var(--font-bebas), sans-serif" }}
      >
        {score}
      </text>
    </svg>
  )
}

/* ── Horizontal bar for a category ── */
function CategoryBar({ cat, bikes, colors }: { cat: Category; bikes: Bike[]; colors: string[] }) {
  const max = Math.max(...Object.values(cat.scores))

  return (
    <div className="py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{cat.icon}</span>
        <span className="text-xs font-black uppercase tracking-wider">{cat.name}</span>
      </div>
      <div className="space-y-1.5 mb-1.5">
        {bikes.map((bike, i) => {
          const score = cat.scores[bike.name] ?? 0
          const isWinner = score === max
          return (
            <div key={bike.id} className="flex items-center gap-2">
              <span className="text-[10px] font-bold w-20 flex-shrink-0 truncate" style={{ color: "var(--muted)" }}>
                {bike.name.split(" ").slice(-2).join(" ")}
              </span>
              <div className="flex-1 relative" style={{ height: 18, backgroundColor: "var(--cream)", border: "1px solid var(--border)" }}>
                <div
                  className="absolute top-0 left-0 h-full flex items-center justify-end pr-1.5 transition-all duration-700"
                  style={{ width: `${score}%`, backgroundColor: isWinner ? colors[i] : colors[i] + "99", minWidth: 20 }}
                >
                  {score >= 30 && (
                    <span className="text-[9px] font-black text-white">{score}</span>
                  )}
                </div>
                {score < 30 && (
                  <span className="absolute left-full ml-1 text-[9px] font-black" style={{ color: colors[i] }}>{score}</span>
                )}
              </div>
              {isWinner && bikes.length > 1 && (
                <span className="text-[10px]">✓</span>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-[11px] italic" style={{ color: "var(--muted)" }}>{cat.insight}</p>
    </div>
  )
}

const BIKE_COLORS = ["var(--coral)", "#3B82F6", "#10B981"]

interface AICompareProps {
  bikes: (Bike | null)[]
}

export default function AICompare({ bikes }: AICompareProps) {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState({ categories: true, usecases: true, personas: true })

  const activeBikes = bikes.filter(Boolean) as Bike[]

  async function runAnalysis() {
    if (activeBikes.length < 2) return
    setLoading(true)
    setError("")
    setReport(null)

    try {
      const res = await fetch("/api/ai-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bike_ids: activeBikes.map(b => b.id) }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setReport(data.report)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  if (activeBikes.length < 2) return null

  return (
    <div className="mt-6">
      {!report && !loading && (
        <button
          onClick={runAnalysis}
          className="w-full flex items-center justify-center gap-3 py-4 text-sm uppercase tracking-wider font-black press-active transition-all"
          style={{
            backgroundColor: "var(--charcoal)",
            color: "white",
            border: "3px solid var(--charcoal)",
            boxShadow: "5px 5px 0 var(--coral)",
          }}
        >
          <Sparkles size={18} style={{ color: "var(--amber)" }} />
          AI Analysis — Compare with GPT
          <Sparkles size={18} style={{ color: "var(--amber)" }} />
        </button>
      )}

      {loading && (
        <div
          className="flex flex-col items-center gap-4 py-12"
          style={{ backgroundColor: "var(--charcoal)", border: "3px solid var(--charcoal)", boxShadow: "5px 5px 0 var(--coral)" }}
        >
          <Loader2 size={36} className="animate-spin" style={{ color: "var(--coral)" }} />
          <div className="text-center">
            <p className="text-white font-black uppercase tracking-wider" style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20 }}>
              AI IS ANALYSING...
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              Scoring {activeBikes.length} bikes across 8 dimensions
            </p>
          </div>
          {/* Animated bike names */}
          <div className="flex gap-3">
            {activeBikes.map((b, i) => (
              <span key={b.id} className="text-xs font-bold px-2 py-1" style={{ backgroundColor: BIKE_COLORS[i], color: "white" }}>
                {b.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 text-sm" style={{ backgroundColor: "#FFF5F5", border: "2px solid var(--coral)" }}>
          <span className="font-bold">Error: </span>{error}
        </div>
      )}

      {report && (
        <div className="space-y-4">
          {/* ── VERDICT HERO ── */}
          <div
            className="relative overflow-hidden"
            style={{ backgroundColor: "var(--charcoal)", border: "3px solid var(--charcoal)", boxShadow: "5px 5px 0 var(--coral)" }}
          >
            {/* bg grid */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(var(--coral) 1px,transparent 1px),linear-gradient(90deg,var(--coral) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />

            <div className="relative p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} style={{ color: "var(--amber)" }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--amber)" }}>AI Verdict</span>
              </div>

              {/* Winner */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <Trophy size={40} style={{ color: "var(--amber)" }} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Overall Winner</p>
                  <p className="text-3xl sm:text-4xl text-white leading-none" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>
                    {report.verdict.winner}
                  </p>
                  <p className="text-sm mt-1" style={{ color: "var(--amber)" }}>{report.verdict.tagline}</p>
                </div>
              </div>

              {/* Summary */}
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
                {report.summary}
              </p>

              {/* Quick winners row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                {[
                  { label: "Best Value", value: report.verdict.best_value, icon: "💰" },
                  { label: "Highway", value: report.verdict.best_for_highway, icon: "🛣️" },
                  { label: "City", value: report.verdict.best_for_city, icon: "🏙️" },
                  { label: "Mileage", value: report.verdict.best_mileage, icon: "⛽" },
                  ...(report.verdict.runner_up ? [{ label: "Runner Up", value: report.verdict.runner_up, icon: "🥈" }] : []),
                ].map(item => (
                  <div key={item.label} className="px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{item.icon} {item.label}</p>
                    <p className="text-xs font-black text-white truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RADAR SCORES ── */}
          <div className="bg-white retro-border p-4">
            <button
              className="w-full flex items-center justify-between mb-3"
              onClick={() => setExpanded(e => ({ ...e, categories: !e.categories }))}
            >
              <p className="text-lg font-black uppercase" style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.04em" }}>
                📊 Category Scores
              </p>
              {expanded.categories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded.categories && (
              <>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {activeBikes.map((b, i) => (
                    <div key={b.id} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: BIKE_COLORS[i] }} />
                      <span className="text-xs font-bold">{b.name}</span>
                    </div>
                  ))}
                </div>

                {/* Overall score rings */}
                <div className="flex justify-around mb-5 flex-wrap gap-4">
                  {activeBikes.map((bike, i) => {
                    const avg = Math.round(
                      report.categories.reduce((sum, cat) => sum + (cat.scores[bike.name] ?? 0), 0) / report.categories.length
                    )
                    const isWinner = report.verdict.winner === bike.name
                    return (
                      <div key={bike.id} className="flex flex-col items-center gap-1.5">
                        <div className="relative">
                          <ScoreRing score={avg} color={BIKE_COLORS[i]} size={72} />
                          {isWinner && (
                            <div className="absolute -top-2 -right-2">
                              <Trophy size={16} style={{ color: "var(--amber)" }} />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-black text-center" style={{ color: BIKE_COLORS[i] }}>{bike.name}</p>
                        <p className="text-[10px]" style={{ color: "var(--muted)" }}>Overall</p>
                      </div>
                    )
                  })}
                </div>

                {/* Bar chart per category */}
                <div>
                  {report.categories.map(cat => (
                    <CategoryBar key={cat.name} cat={cat} bikes={activeBikes} colors={BIKE_COLORS} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── KEY DIFFERENCES ── */}
          <div className="bg-white retro-border p-4">
            <p className="text-lg font-black uppercase mb-3" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>
              ⚡ Key Differences
            </p>
            <div className="space-y-2">
              {report.key_differences.map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-3" style={{ backgroundColor: "var(--cream)", border: "1.5px solid var(--border)" }}>
                  <span className="font-black text-sm flex-shrink-0" style={{ color: "var(--coral)" }}>{i + 1}</span>
                  <p className="text-sm">{d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── USE CASES ── */}
          <div className="bg-white retro-border p-4">
            <button
              className="w-full flex items-center justify-between mb-3"
              onClick={() => setExpanded(e => ({ ...e, usecases: !e.usecases }))}
            >
              <p className="text-lg font-black uppercase" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>
                🗺️ Use Case Winners
              </p>
              {expanded.usecases ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded.usecases && (
              <div className="space-y-2">
                {report.use_cases.map((uc, i) => {
                  const bikeIdx = activeBikes.findIndex(b => b.name === uc.winner)
                  const color = bikeIdx >= 0 ? BIKE_COLORS[bikeIdx] : "var(--charcoal)"
                  return (
                    <div key={i} className="flex items-start gap-3 p-3" style={{ border: "1.5px solid var(--border)", borderLeft: `4px solid ${color}` }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--muted)" }}>{uc.use}</p>
                        <p className="text-base font-black" style={{ fontFamily: "var(--font-bebas), sans-serif", color }}>{uc.winner}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{uc.reason}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── BUYER PERSONAS ── */}
          <div className="bg-white retro-border p-4">
            <button
              className="w-full flex items-center justify-between mb-3"
              onClick={() => setExpanded(e => ({ ...e, personas: !e.personas }))}
            >
              <p className="text-lg font-black uppercase" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>
                👤 Who Should Buy What?
              </p>
              {expanded.personas ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded.personas && (
              <div className="grid sm:grid-cols-3 gap-3">
                {report.buyer_personas.map((p, i) => {
                  const bikeIdx = activeBikes.findIndex(b => b.name === p.recommendation)
                  const color = bikeIdx >= 0 ? BIKE_COLORS[bikeIdx] : "var(--charcoal)"
                  return (
                    <div key={i} className="p-3 flex flex-col gap-1.5" style={{ backgroundColor: "var(--cream)", border: "2px solid var(--charcoal)" }}>
                      <p className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--muted)" }}>{p.persona}</p>
                      <p className="text-xl font-black leading-none" style={{ fontFamily: "var(--font-bebas), sans-serif", color }}>
                        {p.recommendation}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{p.reason}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Re-run */}
          <button
            onClick={runAnalysis}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-wider font-black retro-btn press-active"
            style={{ backgroundColor: "white" }}
          >
            <RotateCcw size={13} /> Re-run AI Analysis
          </button>
        </div>
      )}
    </div>
  )
}
