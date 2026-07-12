import type { Metadata } from "next"
import { Space_Grotesk, Bebas_Neue } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import ChatBot from "@/components/chat/ChatBot"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
})

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
})

export const metadata: Metadata = {
  title: "BikeGuru — Find Your Perfect Ride Under 2.5L",
  description: "India's most comprehensive bike research tool. Compare, wishlist, and chat with AI about bikes under ₹2.5 Lakh.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${bebasNeue.variable}`}>
      <body
        className="min-h-screen"
        style={{
          fontFamily: "var(--font-space), system-ui, sans-serif",
          backgroundColor: "var(--cream)",
        }}
      >
        <Navbar />
        <main>{children}</main>
        <ChatBot />
      </body>
    </html>
  )
}
