import Link from "next/link"
import { ArrowRight, Search, Heart, GitCompare, MessageCircle, Star, TrendingUp, Shield, Zap } from "lucide-react"
import { getServerSupabase } from "@/lib/supabase"
import { Bike } from "@/types/bike"
import { formatPrice } from "@/lib/utils"

async function getTopBikes(): Promise<Bike[]> {
  const supabase = getServerSupabase()
  const { data } = await supabase
    .from("bikes")
    .select("*")
    .order("rating", { ascending: false })
    .limit(6)
  return data || []
}

async function getStats() {
  const supabase = getServerSupabase()
  const { count: bikeCount } = await supabase.from("bikes").select("*", { count: "exact", head: true })
  const { data: brands } = await supabase.from("bikes").select("brand")
  const uniqueBrands = new Set(brands?.map((b) => b.brand)).size
  return { bikeCount: bikeCount || 0, uniqueBrands }
}

export default async function HomePage() {
  const [topBikes, stats] = await Promise.all([getTopBikes(), getStats()])

  return (
    <div>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "var(--charcoal)", minHeight: "70vh" }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(var(--coral) 1px, transparent 1px), linear-gradient(90deg, var(--coral) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest"
                style={{ backgroundColor: "var(--coral)", color: "white" }}
              >
                <Star size={12} fill="white" />
                India&apos;s #1 Bike Research Tool
              </div>

              <h1
                className="text-6xl md:text-8xl leading-none mb-4"
                style={{
                  fontFamily: "var(--font-bebas), sans-serif",
                  color: "white",
                  letterSpacing: "0.02em",
                }}
              >
                FIND YOUR
                <br />
                <span style={{ color: "var(--coral)" }}>PERFECT</span>
                <br />
                RIDE
              </h1>

              <p
                className="text-lg mb-8 max-w-md"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Research, compare, and shortlist bikes under{" "}
                <strong style={{ color: "var(--amber)" }}>₹2.5 Lakh</strong> on-road.
                Chat with our AI for personalized recommendations.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/bikes" className="retro-btn-coral px-6 py-3 flex items-center gap-2 text-base">
                  Browse All Bikes
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/compare"
                  className="retro-btn px-6 py-3 flex items-center gap-2 text-base"
                  style={{ backgroundColor: "transparent", color: "white", borderColor: "white", boxShadow: "3px 3px 0 white" }}
                >
                  <GitCompare size={16} />
                  Compare Bikes
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-10">
                {[
                  { value: `${stats.bikeCount}+`, label: "Bikes Listed" },
                  { value: `${stats.uniqueBrands}`, label: "Brands" },
                  { value: "₹2.5L", label: "Max Budget" },
                ].map((s) => (
                  <div key={s.label}>
                    <p
                      className="text-3xl font-black"
                      style={{ fontFamily: "var(--font-bebas), sans-serif", color: "var(--coral)" }}
                    >
                      {s.value}
                    </p>
                    <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero illustration */}
            <div className="hidden md:flex items-center justify-center">
              <div
                className="relative text-center p-8"
                style={{
                  border: "3px solid var(--coral)",
                  backgroundColor: "rgba(232,88,61,0.1)",
                }}
              >
                <div style={{ fontSize: 120, lineHeight: 1 }}>🏍️</div>
                <div
                  className="mt-4 px-4 py-2 text-sm font-bold uppercase tracking-widest"
                  style={{ backgroundColor: "var(--coral)", color: "white" }}
                >
                  AI-Powered Recommendations
                </div>
                <div
                  className="absolute -bottom-3 -right-3 px-3 py-2 text-xs font-bold uppercase"
                  style={{ backgroundColor: "var(--amber)", color: "var(--charcoal)" }}
                >
                  Budget ≤ ₹2.5L
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section
        style={{ backgroundColor: "var(--amber)", borderTop: "2px solid var(--charcoal)", borderBottom: "2px solid var(--charcoal)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Search size={18} />, label: "Smart Search & Filter" },
              { icon: <GitCompare size={18} />, label: "Side-by-Side Compare" },
              { icon: <Heart size={18} />, label: "Save to Wishlist" },
              { icon: <MessageCircle size={18} />, label: "AI Bike Advisor" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider"
                style={{ color: "var(--charcoal)" }}
              >
                {f.icon}
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top rated bikes */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "var(--muted)" }}
            >
              Editor&apos;s Picks
            </p>
            <h2
              className="text-5xl"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              TOP RATED BIKES
            </h2>
          </div>
          <Link
            href="/bikes"
            className="retro-btn px-4 py-2 text-sm uppercase tracking-wider hidden md:flex items-center gap-2"
            style={{ backgroundColor: "white" }}
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topBikes.map((bike) => (
            <TopBikeCard key={bike.id} bike={bike} />
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link
            href="/bikes"
            className="retro-btn-coral px-6 py-3 inline-flex items-center gap-2"
          >
            View All Bikes <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section style={{ backgroundColor: "var(--off-white)", borderTop: "2px solid var(--border)", borderBottom: "2px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2
            className="text-5xl mb-8"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            SHOP BY CATEGORY
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { cat: "commuter", emoji: "🛵", label: "Commuters", desc: "60+ kmpl", color: "#4CAF50" },
              { cat: "sport", emoji: "🏎️", label: "Sport", desc: "Fast & fun", color: "var(--coral)" },
              { cat: "adventure", emoji: "🏔️", label: "Adventure", desc: "Highway ready", color: "var(--amber)" },
              { cat: "cruiser", emoji: "🤠", label: "Cruisers", desc: "Laid-back style", color: "#9C27B0" },
              { cat: "scooter", emoji: "🛺", label: "Scooters", desc: "City handy", color: "#2196F3" },
            ].map((c) => (
              <Link
                key={c.cat}
                href={`/bikes?category=${c.cat}`}
                className="retro-border card-hover p-6 flex flex-col items-center text-center gap-2"
                style={{ backgroundColor: "white" }}
              >
                <span style={{ fontSize: 40 }}>{c.emoji}</span>
                <p
                  className="font-black uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20, color: c.color }}
                >
                  {c.label}
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why BikeGuru */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-5xl mb-6"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              WHY USE
              <br />
              <span style={{ color: "var(--coral)" }}>BIKEGURU?</span>
            </h2>
            <div className="space-y-4">
              {[
                { icon: <TrendingUp size={20} />, title: "Real Specs", desc: "Actual on-road prices, real mileage figures, verified specs for every bike." },
                { icon: <GitCompare size={20} />, title: "Smart Compare", desc: "Compare up to 3 bikes side-by-side with a full spec sheet breakdown." },
                { icon: <Shield size={20} />, title: "Unbiased", desc: "No brand sponsorships. Pure data-driven recommendations for your budget." },
                { icon: <Zap size={20} />, title: "AI Advisor", desc: "Chat with BikeGuru AI — powered by GPT-4o, trained on Indian bike data." },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex gap-4 p-4"
                  style={{ border: "1.5px solid var(--border)" }}
                >
                  <div
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "var(--cream)", color: "var(--coral)" }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <p className="font-black uppercase text-sm tracking-wider">{f.title}</p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA box */}
          <div
            className="p-8 flex flex-col gap-4"
            style={{
              backgroundColor: "var(--charcoal)",
              border: "3px solid var(--charcoal)",
              boxShadow: "8px 8px 0 var(--coral)",
            }}
          >
            <div style={{ fontSize: 60 }}>🤖</div>
            <h3
              className="text-4xl text-white"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              CHAT WITH
              <br />
              <span style={{ color: "var(--coral)" }}>BIKEGURU AI</span>
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)" }}>
              Tell us your needs — daily commute, highway touring, sporty fun — and get an instant personalized recommendation.
            </p>
            <div
              className="p-3 text-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
            >
              <span style={{ color: "var(--coral)" }}>You:</span> I need a bike for 40km daily commute, budget ₹1.2L
              <br />
              <span style={{ color: "var(--amber)" }}>AI:</span> Based on your commute, the Bajaj Platina 110 gives 70 kmpl...
            </div>
            <div
              className="retro-btn-coral py-3 text-base uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Click Chat Icon (Bottom Right ↘)
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "var(--charcoal)",
          borderTop: "3px solid var(--coral)",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-bebas), sans-serif", color: "white" }}
            >
              BIKE<span style={{ color: "var(--coral)" }}>GURU</span>
            </p>
            <p className="text-xs">Find your perfect ride under ₹2.5L</p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/bikes" className="hover:text-white transition-colors">All Bikes</Link>
            <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
            <Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link>
          </div>
          <p className="text-xs">Prices approximate. Verify at dealership.</p>
        </div>
      </footer>
    </div>
  )
}

function TopBikeCard({ bike }: { bike: Bike }) {
  return (
    <Link
      href={`/bikes/${bike.id}`}
      className="bg-white retro-border card-hover flex gap-4 p-4"
    >
      <div
        className="w-20 h-20 flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: "var(--cream)" }}
      >
        {bike.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bike.image_url} alt={bike.name} className="w-full h-full object-contain p-1" />
        ) : (
          <span className="text-4xl">🏍️</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          {bike.brand}
        </p>
        <p
          className="text-lg leading-tight"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          {bike.name}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={10}
              fill={s <= Math.round(bike.rating) ? "var(--amber)" : "none"}
              stroke={s <= Math.round(bike.rating) ? "var(--amber)" : "var(--border)"}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>{bike.rating}</span>
        </div>
        <p
          className="text-xl font-black mt-1"
          style={{ fontFamily: "var(--font-bebas), sans-serif", color: "var(--coral)" }}
        >
          {formatPrice(bike.price_on_road)}
        </p>
      </div>
    </Link>
  )
}
