"use client"

import { useState } from "react"
import { X, Copy, Check, Share2, MessageCircle, Link as LinkIcon } from "lucide-react"

interface ShareModalProps {
  open: boolean
  onClose: () => void
  title: string
  url: string
  description?: string
}

export default function ShareModal({ open, onClose, title, url, description }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url
  const text = `${title}${description ? " — " + description : ""}`

  async function copyLink() {
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function nativeShare() {
    if (navigator.share) {
      await navigator.share({ title, text, url: fullUrl })
    }
  }

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: <MessageCircle size={18} />,
      color: "#25D366",
      href: `https://wa.me/?text=${encodeURIComponent(text + "\n" + fullUrl)}`,
    },
    {
      label: "Twitter/X",
      icon: <span className="font-black text-base leading-none">𝕏</span>,
      color: "#000",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`,
    },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50"
        onClick={onClose}
        style={{ backdropFilter: "blur(2px)" }}
      />

      {/* Modal — bottom sheet on mobile, centered on desktop */}
      <div
        className="fixed z-[61] bg-white"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          border: "3px solid var(--charcoal)",
          borderBottom: "none",
          boxShadow: "0 -6px 0 var(--charcoal)",
          maxWidth: 480,
          margin: "0 auto",
          borderRadius: 0,
          // desktop: center
          ...(typeof window !== "undefined" && window.innerWidth >= 640
            ? { top: "50%", left: "50%", right: "auto", bottom: "auto", transform: "translate(-50%,-50%)", borderBottom: "3px solid var(--charcoal)", boxShadow: "6px 6px 0 var(--charcoal)" }
            : {}),
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: "var(--charcoal)", borderBottom: "2px solid var(--coral)" }}
        >
          <div className="flex items-center gap-2">
            <Share2 size={16} color="white" />
            <p
              className="text-base text-white"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.06em" }}
            >
              SHARE
            </p>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.6)" }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <p className="font-black text-base" style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20 }}>
              {title}
            </p>
            {description && <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{description}</p>}
          </div>

          {/* Copy link */}
          <div
            className="flex items-center gap-2 p-3"
            style={{ backgroundColor: "var(--cream)", border: "2px solid var(--border)" }}
          >
            <LinkIcon size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <span className="flex-1 text-xs truncate font-mono" style={{ color: "var(--muted)" }}>
              {fullUrl}
            </span>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider flex-shrink-0"
              style={{
                backgroundColor: copied ? "#4CAF50" : "var(--charcoal)",
                color: "white",
                border: "none",
                transition: "background 0.2s",
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-wider"
                style={{
                  backgroundColor: s.color,
                  color: "white",
                  border: "2px solid var(--charcoal)",
                  boxShadow: "3px 3px 0 var(--charcoal)",
                }}
              >
                {s.icon} {s.label}
              </a>
            ))}
          </div>

          {/* Native share (mobile) */}
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={nativeShare}
              className="w-full py-3 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--coral)",
                color: "white",
                border: "2px solid var(--charcoal)",
                boxShadow: "3px 3px 0 var(--charcoal)",
              }}
            >
              <Share2 size={16} /> Share via Phone
            </button>
          )}
        </div>
      </div>
    </>
  )
}
