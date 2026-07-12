"use client"

import Link from "next/link"
import { Heart, GitCompare, Star, Zap, Droplet, Weight } from "lucide-react"
import { Bike } from "@/types/bike"
import { formatPrice } from "@/lib/utils"
import { useState } from "react"

const CATEGORY_COLORS: Record<string, string> = {
  commuter: "#4CAF50",
  sport: "#E8583D",
  adventure: "#F5A623",
  cruiser: "#9C27B0",
  scooter: "#2196F3",
}

interface BikeCardProps {
  bike: Bike
  onWishlist?: (id: string) => void
  onCompare?: (id: string) => void
  isWishlisted?: boolean
  isCompared?: boolean
}

export default function BikeCard({
  bike,
  onWishlist,
  onCompare,
  isWishlisted,
  isCompared,
}: BikeCardProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className="bg-white retro-border card-hover flex flex-col overflow-hidden"
      style={{ borderRadius: 0 }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: "#F0EBE0", height: 180 }}
      >
        {!imgError && bike.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bike.image_url}
            alt={bike.name}
            className="w-full h-full object-contain p-4"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ fontSize: 64 }}>🏍️</span>
          </div>
        )}

        {/* Category badge */}
        <div
          className="absolute top-2 left-2 tag-pill text-white"
          style={{
            backgroundColor: CATEGORY_COLORS[bike.category] || "#666",
            border: "1.5px solid var(--charcoal)",
          }}
        >
          {bike.category}
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => onWishlist?.(bike.id)}
            className="w-7 h-7 flex items-center justify-center retro-btn"
            style={{
              backgroundColor: isWishlisted ? "var(--coral)" : "white",
              color: isWishlisted ? "white" : "var(--charcoal)",
            }}
            title="Add to wishlist"
          >
            <Heart size={13} fill={isWishlisted ? "white" : "none"} />
          </button>
          <button
            onClick={() => onCompare?.(bike.id)}
            className="w-7 h-7 flex items-center justify-center retro-btn"
            style={{
              backgroundColor: isCompared ? "var(--amber)" : "white",
              color: "var(--charcoal)",
            }}
            title="Add to compare"
          >
            <GitCompare size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Brand & name */}
        <div>
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--muted)" }}
          >
            {bike.brand}
          </p>
          <h3
            className="text-xl leading-tight"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            {bike.name}
          </h3>
        </div>

        {/* Price */}
        <div
          className="px-3 py-2"
          style={{ backgroundColor: "var(--cream)", border: "1.5px solid var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            On-Road Price
          </p>
          <p
            className="text-2xl font-black"
            style={{ fontFamily: "var(--font-bebas), sans-serif", color: "var(--coral)" }}
          >
            {formatPrice(bike.price_on_road)}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Zap size={11} style={{ color: "var(--coral)" }} />
              <span className="text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>Power</span>
            </div>
            <p className="text-sm font-bold">{bike.max_power?.split(" ")[0] || "—"}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>bhp</p>
          </div>
          <div className="text-center" style={{ borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Droplet size={11} style={{ color: "#2196F3" }} />
              <span className="text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>Mileage</span>
            </div>
            <p className="text-sm font-bold">{bike.mileage_kmpl}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>kmpl</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Weight size={11} style={{ color: "#4CAF50" }} />
              <span className="text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>CC</span>
            </div>
            <p className="text-sm font-bold">{bike.engine_cc}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>cc</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={12}
                fill={s <= Math.round(bike.rating) ? "var(--amber)" : "none"}
                stroke={s <= Math.round(bike.rating) ? "var(--amber)" : "var(--border)"}
              />
            ))}
          </div>
          <span className="text-xs font-bold">{bike.rating}</span>
          <span className="text-xs" style={{ color: "var(--muted)" }}>({bike.review_count?.toLocaleString()})</span>
        </div>

        {/* CTA */}
        <Link
          href={`/bikes/${bike.id}`}
          className="retro-btn-coral text-center py-2 text-sm uppercase tracking-wider block mt-auto"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}
