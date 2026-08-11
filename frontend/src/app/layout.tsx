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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tourigent.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tourigent — Vintage Paper Travel Guidebook & AI Itinerary Agent",
    template: "%s | Tourigent",
  },
  description:
    "Curated vintage travel itinerary app with handcrafted paper ledgers, custom stamps, unfolding canvas maps, vector search swapping, and live verified venue details.",
  keywords: [
    "tourigent",
    "vintage travel guidebook",
    "skeuomorphic itinerary",
    "AI travel planner",
    "travel ledger",
    "Qdrant vector search",
    "Gemini grounding",
    "pageflip guidebook",
    "trip planner",
    "custom itinerary",
  ],
  authors: [{ name: "Tourigent Team" }],
  creator: "Tourigent",
  publisher: "Tourigent",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Tourigent — Vintage Paper Travel Guidebook & AI Itinerary Agent",
    description:
      "Transform trip planning into an alpine expedition guidebook experience with handcrafted paper ledgers, wax seals, and vector DB search.",
    url: siteUrl,
    siteName: "Tourigent",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tourigent — Vintage Paper Travel Guidebook & AI Itinerary Agent",
    description:
      "Transform trip planning into an alpine expedition guidebook experience with handcrafted paper ledgers and AI vector search.",
    creator: "@tourigent",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tourigent",
  url: siteUrl,
  applicationCategory: "TravelApplication",
  operatingSystem: "All",
  description:
    "Interactive vintage paper travel guidebook generator utilizing LangGraph AI pipelines, Gemini search grounding, and Qdrant vector memory.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-topo-pattern text-[#2d3130] font-sans selection:bg-[#22382c] selection:text-[#f5f0eb]">
        {children}
      </body>
    </html>
  )
}

