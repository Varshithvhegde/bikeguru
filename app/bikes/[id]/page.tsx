import { notFound } from "next/navigation"
import { getServerSupabase } from "@/lib/supabase"
import { Bike } from "@/types/bike"
import { formatPrice, formatPriceExact } from "@/lib/utils"
import Link from "next/link"
import BikeImage from "@/components/bikes/BikeImage"
import BikeDetailClient from "@/components/bikes/BikeDetailClient"
import {
  ArrowLeft, Star, Zap, Droplet, Weight, Gauge, Fuel, ArrowUpDown,
  Shield, Check, X, GitCompare
} from "lucide-react"

async function getBike(id: string): Promise<Bike | null> {
  const supabase = getServerSupabase()
  const { data } = await supabase.from("bikes").select("*").eq("id", id).single()
  return data
}

async function getSimilar(bike: Bike): Promise<Bike[]> {
  const supabase = getServerSupabase()
  const { data } = await supabase
    .from("bikes")
    .select("*")
    .eq("category", bike.category)
    .neq("id", bike.id)
    .order("rating", { ascending: false })
    .limit(3)
  return data || []
}

export default async function BikeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const bike = await getBike(id)
  if (!bike) notFound()

  const similar = await getSimilar(bike)

  const specs = [
    { label: "Engine", value: `${bike.engine_cc}cc`, icon: <Zap size={16} /> },
    { label: "Max Power", value: bike.max_power, icon: <Zap size={16} /> },
    { label: "Max Torque", value: bike.max_torque, icon: <Gauge size={16} /> },
    { label: "Mileage", value: `${bike.mileage_kmpl} kmpl`, icon: <Droplet size={16} /> },
    { label: "Top Speed", value: `${bike.top_speed} km/h`, icon: <Gauge size={16} /> },
    { label: "Weight", value: `${bike.weight_kg} kg`, icon: <Weight size={16} /> },
    { label: "Fuel Tank", value: `${bike.fuel_tank_liters} L`, icon: <Fuel size={16} /> },
    { label: "Seat Height", value: `${bike.seat_height_mm} mm`, icon: <ArrowUpDown size={16} /> },
    { label: "Ground Clearance", value: `${bike.ground_clearance_mm} mm`, icon: <Shield size={16} /> },
    { label: "ABS", value: bike.abs === 2 ? "Dual Channel" : bike.abs === 1 ? "Single Channel" : "None", icon: <Shield size={16} /> },
    { label: "Fuel Type", value: bike.fuel_type || "Petrol", icon: <Fuel size={16} /> },
  ]

  return (
    <div style={{ backgroundColor: "var(--cream)" }}>
      {/* Back */}
      <div
        style={{
          backgroundColor: "var(--charcoal)",
          borderBottom: "2px solid var(--coral)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/bikes"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            <ArrowLeft size={14} /> All Bikes
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div>
            <BikeImage src={bike.image_url} alt={bike.name} height={320} />
            {/* Color options */}
            {bike.colors && bike.colors.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
                  Available Colors
                </p>
                <div className="flex flex-wrap gap-2">
                  {bike.colors.map((c) => (
                    <span
                      key={c}
                      className="tag-pill text-xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  {bike.brand} · {bike.model_year}
                </p>
                <h1
                  className="text-5xl leading-tight"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  {bike.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= Math.round(bike.rating) ? "var(--amber)" : "none"}
                        stroke={s <= Math.round(bike.rating) ? "var(--amber)" : "var(--border)"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold">{bike.rating}</span>
                  <span className="text-sm" style={{ color: "var(--muted)" }}>({bike.review_count?.toLocaleString()} reviews)</span>
                </div>
              </div>

              <span
                className="tag-pill capitalize text-white"
                style={{ backgroundColor: "var(--coral)", border: "1.5px solid var(--charcoal)" }}
              >
                {bike.category}
              </span>
            </div>

            {/* Prices */}
            <div
              className="mb-6 p-4"
              style={{ border: "2px solid var(--charcoal)", backgroundColor: "white" }}
            >
              {/* On-road headline */}
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
                On-Road Price — Bangalore, Karnataka
              </p>
              <p
                className="text-5xl font-black leading-none mb-1"
                style={{ fontFamily: "var(--font-bebas), sans-serif", color: "var(--coral)" }}
              >
                {formatPrice(bike.price_on_road)}
              </p>
              <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>{formatPriceExact(bike.price_on_road)}</p>

              {/* Breakdown */}
              {bike.price_ex_showroom && (() => {
                const ex = bike.price_ex_showroom
                const cc = bike.engine_cc
                const taxRate = cc <= 150 ? 0.13 : 0.14
                const tax = Math.round(ex * taxRate)
                const insurance = cc <= 150 ? 8000 : cc <= 350 ? 12000 : 15000
                return (
                  <div
                    className="grid grid-cols-2 gap-x-4 gap-y-1 pt-3 text-xs"
                    style={{ borderTop: "1px dashed var(--border)" }}
                  >
                    {[
                      ["Ex-Showroom", formatPriceExact(ex)],
                      [`Road Tax (${(taxRate*100).toFixed(0)}% KA)`, `+ ${formatPriceExact(tax)}`],
                      ["Insurance", `+ ${formatPriceExact(insurance)}`],
                      ["Handling", "+ ₹3,500"],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between">
                        <span style={{ color: "var(--muted)" }}>{label}</span>
                        <span className="font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { val: `${bike.engine_cc}cc`, label: "Engine" },
                { val: `${bike.mileage_kmpl}`, label: "kmpl" },
                { val: `${bike.top_speed}`, label: "top km/h" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center p-3"
                  style={{ border: "2px solid var(--charcoal)", backgroundColor: "white" }}
                >
                  <p
                    className="text-3xl font-black"
                    style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                  >
                    {s.val}
                  </p>
                  <p className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--muted)" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <BikeDetailClient bike={bike} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Full specs */}
          <div className="md:col-span-2">
            <h2
              className="text-3xl mb-4"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              FULL SPECIFICATIONS
            </h2>
            <div
              className="bg-white"
              style={{ border: "2px solid var(--charcoal)" }}
            >
              {specs.map((s, i) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    borderBottom: i < specs.length - 1 ? "1px solid var(--border)" : "none",
                    backgroundColor: i % 2 === 0 ? "white" : "var(--cream)",
                  }}
                >
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    <span style={{ color: "var(--coral)" }}>{s.icon}</span>
                    {s.label}
                  </div>
                  <span className="text-sm font-bold">{s.value}</span>
                </div>
              ))}
            </div>

            {/* Features */}
            {bike.features && bike.features.length > 0 && (
              <div className="mt-6">
                <h3
                  className="text-2xl mb-3"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  KEY FEATURES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {bike.features.map((f) => (
                    <span key={f} className="tag-pill">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pros & Cons */}
          <div>
            <h2
              className="text-3xl mb-4"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              PROS & CONS
            </h2>

            {bike.pros && bike.pros.length > 0 && (
              <div
                className="mb-4 p-4"
                style={{ border: "2px solid #4CAF50", backgroundColor: "white" }}
              >
                <p
                  className="text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color: "#4CAF50" }}
                >
                  <Check size={14} /> Pros
                </p>
                <ul className="space-y-2">
                  {bike.pros.map((p) => (
                    <li key={p} className="flex gap-2 text-sm">
                      <Check size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#4CAF50" }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {bike.cons && bike.cons.length > 0 && (
              <div
                className="p-4"
                style={{ border: "2px solid var(--coral)", backgroundColor: "white" }}
              >
                <p
                  className="text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color: "var(--coral)" }}
                >
                  <X size={14} /> Cons
                </p>
                <ul className="space-y-2">
                  {bike.cons.map((c) => (
                    <li key={c} className="flex gap-2 text-sm">
                      <X size={12} className="mt-0.5 flex-shrink-0" style={{ color: "var(--coral)" }} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suitable for */}
            {bike.suitable_for && bike.suitable_for.length > 0 && (
              <div
                className="mt-4 p-4"
                style={{ border: "2px solid var(--amber)", backgroundColor: "white" }}
              >
                <p
                  className="text-sm font-black uppercase tracking-wider mb-3"
                  style={{ color: "var(--amber)" }}
                >
                  Best For
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bike.suitable_for.map((s) => (
                    <span
                      key={s}
                      className="tag-pill capitalize text-xs"
                      style={{ backgroundColor: "var(--amber)", color: "white", borderColor: "var(--charcoal)" }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar bikes */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2
              className="text-3xl mb-6"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              SIMILAR BIKES YOU MIGHT LIKE
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {similar.map((b) => (
                <Link
                  key={b.id}
                  href={`/bikes/${b.id}`}
                  className="bg-white retro-border card-hover flex gap-4 p-4"
                >
                  <div
                    className="w-20 h-16 flex-shrink-0 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: "var(--cream)" }}
                  >
                    {b.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image_url} alt={b.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-3xl">🏍️</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>{b.brand}</p>
                    <p className="font-black" style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 18 }}>{b.name}</p>
                    <p className="font-black" style={{ color: "var(--coral)", fontFamily: "var(--font-bebas), sans-serif" }}>
                      {formatPrice(b.price_on_road)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
