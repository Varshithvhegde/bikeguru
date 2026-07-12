import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Bebas_Neue } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import BottomNav from "@/components/layout/BottomNav"
import ChatBot from "@/components/chat/ChatBot"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" })
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" })

export const metadata: Metadata = {
  title: "BikeGuru — Find Your Perfect Ride Under 2.5L",
  description: "India's most comprehensive bike research tool. Compare, wishlist, and chat with AI about bikes under ₹2.5 Lakh. Bangalore on-road prices.",
  openGraph: {
    title: "BikeGuru — Find Your Perfect Ride Under ₹2.5L",
    description: "Research, compare & get AI advice on Indian bikes. Bangalore on-road prices.",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1A1A1A",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${bebasNeue.variable}`}>
      <body className="min-h-screen" style={{ fontFamily: "var(--font-space), system-ui, sans-serif", backgroundColor: "var(--cream)" }}>
        <Navbar />
        {/* pb-16 on mobile to clear bottom nav, extra pb for chat button */}
        <main className="pb-20 md:pb-6">{children}</main>
        <BottomNav />
        <ChatBot />
      </body>
    </html>
  )
}
