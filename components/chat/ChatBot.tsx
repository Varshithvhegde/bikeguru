"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Loader2, ChevronDown, Bike } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  role: "user" | "assistant"
  content: string
}

const QUICK = [
  "Xpulse 210 vs NX200?",
  "Best bike under ₹1.5L?",
  "CB350 for daily commute?",
  "Apache RTR 200 vs NS200?",
  "Best highway tourer under 2L?",
  "Lightest 200cc bike?",
]

/* ── Markdown renderer with bike-themed styles ── */
function BotMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed text-[13px]">{children}</p>
        ),
        strong: ({ children }) => (
          <strong style={{ color: "var(--charcoal)", fontWeight: 800 }}>{children}</strong>
        ),
        em: ({ children }) => (
          <em style={{ color: "var(--muted)" }}>{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="mb-2 space-y-1 pl-0" style={{ listStyle: "none" }}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 space-y-1 pl-0" style={{ listStyle: "none", counterReset: "item" }}>{children}</ol>
        ),
        li: ({ children }) => (
          <li className="flex gap-2 items-start text-[13px]">
            <span
              className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2"
              style={{ backgroundColor: "var(--coral)" }}
            />
            <span>{children}</span>
          </li>
        ),
        h1: ({ children }) => (
          <p
            className="text-base font-black uppercase tracking-wider mb-2 mt-3 first:mt-0"
            style={{ fontFamily: "var(--font-bebas), sans-serif", color: "var(--charcoal)", letterSpacing: "0.06em" }}
          >
            {children}
          </p>
        ),
        h2: ({ children }) => (
          <p
            className="text-sm font-black uppercase tracking-wider mb-1.5 mt-3 first:mt-0 pb-1"
            style={{ color: "var(--coral)", borderBottom: "1.5px solid var(--border)" }}
          >
            {children}
          </p>
        ),
        h3: ({ children }) => (
          <p className="text-[13px] font-black uppercase mb-1 mt-2" style={{ color: "var(--charcoal)" }}>
            {children}
          </p>
        ),
        blockquote: ({ children }) => (
          <blockquote
            className="pl-3 py-1 my-2 text-[12px] italic"
            style={{
              borderLeft: "3px solid var(--coral)",
              backgroundColor: "rgba(232,88,61,0.06)",
              color: "var(--muted)",
            }}
          >
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-")
          return isBlock ? (
            <code
              className="block text-[12px] p-2 my-1 font-mono"
              style={{ backgroundColor: "var(--charcoal)", color: "#F5A623" }}
            >
              {children}
            </code>
          ) : (
            <code
              className="px-1 py-0.5 text-[12px] font-mono"
              style={{ backgroundColor: "var(--charcoal)", color: "#F5A623" }}
            >
              {children}
            </code>
          )
        },
        table: ({ children }) => (
          <div className="overflow-x-auto my-2 -mx-1">
            <table
              className="text-[12px] w-full"
              style={{ border: "1.5px solid var(--charcoal)", borderCollapse: "collapse" }}
            >
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead style={{ backgroundColor: "var(--charcoal)", color: "white" }}>{children}</thead>
        ),
        th: ({ children }) => (
          <th
            className="px-2 py-1.5 text-left font-black uppercase tracking-wider text-[11px]"
            style={{ border: "1px solid rgba(255,255,255,0.2)" }}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            className="px-2 py-1.5 text-[12px]"
            style={{ border: "1px solid var(--border)" }}
          >
            {children}
          </td>
        ),
        tr: ({ children, ...props }) => {
          const isEven = (props as { 'data-index'?: number })['data-index'] !== undefined
          return (
            <tr style={{ backgroundColor: isEven ? "var(--cream)" : "white" }}>
              {children}
            </tr>
          )
        },
        hr: () => (
          <hr className="my-2" style={{ border: "none", borderTop: "1.5px dashed var(--border)" }} />
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-bold underline"
            style={{ color: "var(--coral)" }}
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

/* ── Animated typing dots ── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: "var(--coral)",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  )
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm **BikeGuru AI** 🏍️\n\nTell me your riding needs and I'll recommend the perfect bike under ₹2.5L.\n\n*Ask me anything — specs, comparisons, mileage, highway vs city...*",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatBodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    if (!open && messages.length > 1) setUnread((u) => u + 1)
  }, [messages]) // eslint-disable-line

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  async function send(text?: string) {
    const txt = (text ?? input).trim()
    if (!txt || loading) return
    setInput("")

    const userMsg: Message = { role: "user", content: txt }
    setMessages((m) => [...m, userMsg])
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: "assistant", content: data.content }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "**Error** — couldn't reach the AI. Check your OpenAI key and try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3"
        style={{
          backgroundColor: open ? "var(--charcoal)" : "var(--coral)",
          border: "2.5px solid var(--charcoal)",
          boxShadow: open ? "2px 2px 0 var(--charcoal)" : "4px 4px 0 var(--charcoal)",
          transition: "all 0.12s ease",
          borderRadius: 0,
        }}
        aria-label="BikeGuru AI Chat"
      >
        {open ? (
          <>
            <ChevronDown size={18} color="white" />
            <span className="text-sm font-black uppercase tracking-wider text-white">Close</span>
          </>
        ) : (
          <>
            <Bike size={18} color="white" />
            <span className="text-sm font-black uppercase tracking-wider text-white">Ask BikeGuru</span>
            {unread > 0 && (
              <span
                className="w-5 h-5 rounded-full text-xs font-black flex items-center justify-center"
                style={{ backgroundColor: "var(--charcoal)", color: "white" }}
              >
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col slide-in"
          style={{
            width: "min(420px, calc(100vw - 24px))",
            height: "min(580px, calc(100vh - 110px))",
            backgroundColor: "var(--cream)",
            border: "3px solid var(--charcoal)",
            boxShadow: "8px 8px 0 var(--charcoal)",
            borderRadius: 0,
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              backgroundColor: "var(--charcoal)",
              borderBottom: "3px solid var(--coral)",
              flexShrink: 0,
            }}
          >
            {/* Top bar */}
            <div className="px-4 py-3 flex items-center gap-3">
              {/* Bike icon badge */}
              <div
                className="relative flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: "var(--coral)",
                  border: "2px solid white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bike size={18} color="white" />
                <span
                  className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#4CAF50", border: "1.5px solid var(--charcoal)" }}
                />
              </div>

              <div className="flex-1">
                <p
                  className="leading-none"
                  style={{
                    fontFamily: "var(--font-bebas), sans-serif",
                    fontSize: 20,
                    color: "white",
                    letterSpacing: "0.08em",
                  }}
                >
                  BIKEGURU AI
                  <span style={{ color: "var(--coral)" }}>.</span>
                </p>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Powered by GPT-4o-mini
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center transition-colors hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Odometer-style stats strip */}
            <div
              className="px-4 py-1.5 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest"
              style={{ backgroundColor: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.5)" }}
            >
              <span>🏍️ 27 Bikes</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
              <span>💰 Budget ≤ ₹2.5L</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
              <span>🤖 AI-Powered</span>
            </div>
          </div>

          {/* ── Messages ── */}
          <div
            ref={chatBodyRef}
            className="flex-1 overflow-y-auto chat-scroll"
            style={{ padding: "12px 12px 4px" }}
          >
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2 items-end ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center font-black text-[10px]"
                    style={{
                      width: 22,
                      height: 22,
                      backgroundColor: m.role === "user" ? "var(--coral)" : "var(--charcoal)",
                      color: "white",
                      border: "1.5px solid var(--charcoal)",
                      alignSelf: "flex-start",
                      marginTop: 2,
                    }}
                  >
                    {m.role === "user" ? "U" : "AI"}
                  </div>

                  {/* Bubble */}
                  <div
                    className="max-w-[82%]"
                    style={{
                      backgroundColor: m.role === "user" ? "var(--charcoal)" : "white",
                      color: m.role === "user" ? "white" : "var(--charcoal)",
                      border: m.role === "user"
                        ? "2px solid var(--charcoal)"
                        : "2px solid var(--charcoal)",
                      boxShadow: "2px 2px 0 var(--charcoal)",
                      padding: "8px 12px",
                    }}
                  >
                    {m.role === "user" ? (
                      <p className="text-[13px] leading-relaxed font-medium">{m.content}</p>
                    ) : (
                      <BotMessage content={m.content} />
                    )}
                  </div>
                </div>
              ))}

              {/* Loading */}
              {loading && (
                <div className="flex gap-2 items-end">
                  <div
                    className="flex-shrink-0 flex items-center justify-center text-[10px] font-black"
                    style={{
                      width: 22, height: 22,
                      backgroundColor: "var(--charcoal)",
                      color: "white",
                      border: "1.5px solid var(--charcoal)",
                      alignSelf: "flex-start",
                      marginTop: 2,
                    }}
                  >
                    AI
                  </div>
                  <div
                    className="px-3 py-2"
                    style={{
                      backgroundColor: "white",
                      border: "2px solid var(--charcoal)",
                      boxShadow: "2px 2px 0 var(--charcoal)",
                    }}
                  >
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* ── Quick questions (only on first message) ── */}
          {messages.length === 1 && !loading && (
            <div
              className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5"
              style={{ borderTop: "1.5px solid var(--border)" }}
            >
              <p className="w-full text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
                Try asking →
              </p>
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-[11px] px-2 py-1 font-bold uppercase tracking-wide transition-all"
                  style={{
                    border: "1.5px solid var(--charcoal)",
                    backgroundColor: "white",
                    boxShadow: "1.5px 1.5px 0 var(--charcoal)",
                    color: "var(--charcoal)",
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--coral)"
                    ;(e.currentTarget as HTMLButtonElement).style.color = "white"
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = "white"
                    ;(e.currentTarget as HTMLButtonElement).style.color = "var(--charcoal)"
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* ── Input ── */}
          <form
            onSubmit={(e) => { e.preventDefault(); send() }}
            className="flex gap-2 p-3 flex-shrink-0"
            style={{ borderTop: "2.5px solid var(--charcoal)", backgroundColor: "white" }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any bike..."
              className="flex-1 px-3 py-2 text-sm font-medium outline-none"
              style={{
                border: "2px solid var(--charcoal)",
                backgroundColor: "var(--cream)",
                color: "var(--charcoal)",
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-3 py-2 flex items-center justify-center transition-all disabled:opacity-40"
              style={{
                backgroundColor: "var(--coral)",
                border: "2px solid var(--charcoal)",
                boxShadow: "2px 2px 0 var(--charcoal)",
                color: "white",
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
