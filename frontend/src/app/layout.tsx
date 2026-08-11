import type { Metadata } from "next"
import { Cinzel, Cinzel_Decorative, Courier_Prime, Caveat } from "next/font/google"
import "./globals.css"

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
})

const cinzelDecorative = Cinzel_Decorative({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel-dec",
  display: "swap",
})

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-courier",
  display: "swap",
})

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Tourigent — AI Tourist Agent & Vintage Travel Ledger",
  description:
    "Curated vintage travel itinerary app with handcrafted paper ledgers, custom stamps, unfolding canvas maps, and live verified venue details for all tours & holidays worldwide.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cinzelDecorative.variable} ${courierPrime.variable} ${caveat.variable}`}
    >
      <body className="antialiased min-h-screen bg-topo-pattern text-[#2d3130] font-sans selection:bg-[#22382c] selection:text-[#f5f0eb]">
        {children}
      </body>
    </html>
  )
}

