"use client"

import { useState } from "react"

interface BikeImageProps {
  src: string | null
  alt: string
  height?: number
}

export default function BikeImage({ src, alt, height = 320 }: BikeImageProps) {
  const [error, setError] = useState(false)

  return (
    <div
      className="retro-border flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#F0EBE0", height }}
    >
      {src && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain p-6"
          onError={() => setError(true)}
        />
      ) : (
        <span style={{ fontSize: 120 }}>🏍️</span>
      )}
    </div>
  )
}
