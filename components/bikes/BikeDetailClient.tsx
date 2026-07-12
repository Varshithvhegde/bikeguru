"use client"

import { useState } from "react"
import { Heart, Share2, GitCompare } from "lucide-react"
import Link from "next/link"
import ShareModal from "@/components/ui/ShareModal"
import { Bike } from "@/types/bike"
import { formatPrice } from "@/lib/utils"
import { getSessionId } from "@/lib/utils"

interface Props {
  bike: Bike
}

export default function BikeDetailClient({ bike }: Props) {
  const [wishlisted, setWishlisted] = useState(() => {
    if (typeof window === "undefined") return false
    try {
      const stored = JSON.parse(localStorage.getItem("bg_wishlist") || "[]")
      return stored.includes(bike.id)
    } catch { return false }
  })
  const [shareOpen, setShareOpen] = useState(false)

  function toggleWishlist() {
    const stored: string[] = JSON.parse(localStorage.getItem("bg_wishlist") || "[]")
    const next = wishlisted ? stored.filter(id => id !== bike.id) : [...stored, bike.id]
    localStorage.setItem("bg_wishlist", JSON.stringify(next))
    setWishlisted(!wishlisted)
    fetch("/api/wishlist", {
      method: wishlisted ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json", "x-session-id": getSessionId() },
      body: JSON.stringify({ bike_id: bike.id }),
    })
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={toggleWishlist}
          className="retro-btn flex-1 py-2.5 text-sm uppercase tracking-wider flex items-center justify-center gap-2 press-active"
          style={{ backgroundColor: wishlisted ? "var(--coral)" : "white", color: wishlisted ? "white" : "var(--charcoal)" }}
        >
          <Heart size={15} fill={wishlisted ? "white" : "none"} />
          {wishlisted ? "Wishlisted" : "Wishlist"}
        </button>
        <Link
          href={`/compare?ids=${bike.id}`}
          className="retro-btn flex-1 py-2.5 text-sm uppercase tracking-wider flex items-center justify-center gap-2 press-active"
          style={{ backgroundColor: "white" }}
        >
          <GitCompare size={15} /> Compare
        </Link>
        <button
          onClick={() => setShareOpen(true)}
          className="retro-btn-coral px-4 py-2.5 flex items-center justify-center press-active"
        >
          <Share2 size={15} />
        </button>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`${bike.brand} ${bike.name}`}
        url={`/bikes/${bike.id}`}
        description={`${bike.engine_cc}cc · ${formatPrice(bike.price_on_road)} Bangalore on-road · ${bike.mileage_kmpl} kmpl`}
      />
    </>
  )
}
