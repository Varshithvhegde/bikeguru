"use client"

import Link from "next/link"
import { Heart, GitCompare, Star, Zap, Droplet, Share2 } from "lucide-react"
import { Bike } from "@/types/bike"
import { formatPrice } from "@/lib/utils"
import { useState } from "react"
import ShareModal from "@/components/ui/ShareModal"

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

export default function BikeCard({ bike, onWishlist, onCompare, isWishlisted, isCompared }: BikeCardProps) {
  const [imgError, setImgError] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <>
      <div className="bg-white retro-border card-hover flex flex-col overflow-hidden h-full">
        {/* Image */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ backgroundColor: "#F0EBE0", height: 160 }}>
          {!imgError && bike.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bike.image_url} alt={bike.name} className="w-full h-full object-contain p-3" onError={() => setImgError(true)} loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🏍️</div>
          )}

          {/* Category badge */}
          <div className="absolute top-2 left-2 tag-pill text-white text-[10px]" style={{ backgroundColor: CATEGORY_COLORS[bike.category] || "#666", border: "1.5px solid var(--charcoal)" }}>
            {bike.category}
          </div>

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button onClick={() => onWishlist?.(bike.id)} className="w-7 h-7 flex items-center justify-center retro-btn press-active" style={{ backgroundColor: isWishlisted ? "var(--coral)" : "white", color: isWishlisted ? "white" : "var(--charcoal)" }} title="Wishlist">
              <Heart size={12} fill={isWishlisted ? "white" : "none"} />
            </button>
            <button onClick={() => onCompare?.(bike.id)} className="w-7 h-7 flex items-center justify-center retro-btn press-active" style={{ backgroundColor: isCompared ? "var(--amber)" : "white", color: "var(--charcoal)" }} title="Compare">
              <GitCompare size={12} />
            </button>
            <button onClick={() => setShareOpen(true)} className="w-7 h-7 flex items-center justify-center retro-btn press-active" style={{ backgroundColor: "white", color: "var(--charcoal)" }} title="Share">
              <Share2 size={12} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest leading-none" style={{ color: "var(--muted)" }}>{bike.brand}</p>
            <h3 className="text-lg sm:text-xl leading-tight" style={{ fontFamily: "var(--font-bebas), sans-serif" }}>{bike.name}</h3>
          </div>

          {/* Price */}
          <div className="px-2.5 py-1.5" style={{ backgroundColor: "var(--cream)", border: "1.5px solid var(--border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Bangalore On-Road</p>
            <p className="text-xl sm:text-2xl font-black leading-tight" style={{ fontFamily: "var(--font-bebas), sans-serif", color: "var(--coral)" }}>
              {formatPrice(bike.price_on_road)}
            </p>
            {bike.price_ex_showroom && (
              <p className="text-[10px]" style={{ color: "var(--muted)" }}>Ex-showroom {formatPrice(bike.price_ex_showroom)}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1 text-center">
            <div>
              <div className="flex items-center justify-center gap-0.5 mb-0.5">
                <Zap size={9} style={{ color: "var(--coral)" }} />
                <span className="text-[9px] font-bold uppercase" style={{ color: "var(--muted)" }}>Power</span>
              </div>
              <p className="text-xs font-bold leading-none">{bike.max_power?.split(" ")[0] || "—"}</p>
              <p className="text-[9px]" style={{ color: "var(--muted)" }}>bhp</p>
            </div>
            <div style={{ borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
              <div className="flex items-center justify-center gap-0.5 mb-0.5">
                <Droplet size={9} style={{ color: "#2196F3" }} />
                <span className="text-[9px] font-bold uppercase" style={{ color: "var(--muted)" }}>Mileage</span>
              </div>
              <p className="text-xs font-bold leading-none">{bike.mileage_kmpl}</p>
              <p className="text-[9px]" style={{ color: "var(--muted)" }}>kmpl</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-0.5 mb-0.5">
                <span className="text-[9px] font-bold uppercase" style={{ color: "var(--muted)" }}>CC</span>
              </div>
              <p className="text-xs font-bold leading-none">{bike.engine_cc}</p>
              <p className="text-[9px]" style={{ color: "var(--muted)" }}>cc</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={10} fill={s <= Math.round(bike.rating) ? "var(--amber)" : "none"} stroke={s <= Math.round(bike.rating) ? "var(--amber)" : "var(--border)"} />
              ))}
            </div>
            <span className="text-xs font-bold">{bike.rating}</span>
            <span className="text-[10px]" style={{ color: "var(--muted)" }}>({bike.review_count?.toLocaleString()})</span>
          </div>

          {/* CTA */}
          <Link href={`/bikes/${bike.id}`} className="retro-btn-coral text-center py-2 text-xs uppercase tracking-wider block mt-auto press-active">
            View Details →
          </Link>
        </div>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`${bike.brand} ${bike.name}`}
        url={`/bikes/${bike.id}`}
        description={`${bike.engine_cc}cc · ${formatPrice(bike.price_on_road)} Bangalore on-road`}
      />
    </>
  )
}
