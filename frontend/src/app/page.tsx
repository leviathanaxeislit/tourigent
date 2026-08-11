"use client"

import React, { useState } from "react"
import { LandingPage } from "@/components/landing/LandingPage"
import { BookContainer } from "@/components/book/BookContainer"
import { GuidebookOutput, GuidebookRequest } from "@/types/guidebook"
import { generateGuidebook, swapActivityStop, StatusUpdate } from "@/lib/api"

export default function Home() {
  const [guidebook, setGuidebook] = useState<GuidebookOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("Initializing LangGraph Tourist Agent Pipeline...")

  const handleGenerate = async (request: GuidebookRequest) => {
    setLoading(true)
    setStatusMessage("Planning targeted venue searches & itinerary structure...")
    try {
      const data = await generateGuidebook(request, (update: StatusUpdate) => {
        if (update.message) {
          setStatusMessage(update.message)
        }
      })
      setGuidebook(data)
    } catch (e: any) {
      console.warn("Backend API error or stream issue, using fallback mock:", e)
      setGuidebook(createMockGuidebook(request.destination))
    } finally {
      setLoading(false)
    }
  }

  const handleSwapStop = async (dayNumber: number, stopId: string, reason?: string) => {
    if (!guidebook) return
    try {
      const swapRes = await swapActivityStop({
        guidebook_id: guidebook.id,
        day_number: dayNumber,
        stop_id: stopId,
        reason: reason || "Curated alternative vintage venue",
      })

      const updatedPages = guidebook.pages.map((p) => {
        if (p.day_number === dayNumber) {
          return {
            ...p,
            activities: p.activities.map((a) =>
              a.id === stopId ? swapRes.updated_stop : a
            ),
          }
        }
        return p
      })
      setGuidebook({ ...guidebook, pages: updatedPages })
    } catch (e) {
      console.error("Swap stop API call failed:", e)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-topo-pattern flex flex-col items-center justify-center p-6 text-[#2d3130] font-sans">
        <div className="field-ledger-card p-8 border-4 border-[#b8860b] shadow-2xl rounded-sm max-w-md w-full text-center relative deckle-edge">
          <div className="absolute top-2 left-2 brass-rivet" />
          <div className="absolute top-2 right-2 brass-rivet" />

          <div className="pine-wax-seal w-16 h-16 mx-auto mb-4 animate-bounce">
            <span className="text-xl font-serif">✈</span>
          </div>

          <span className="leather-stamp text-xs mb-2">TOURIGENT AI AGENT</span>

          <h2 className="text-xl font-bold font-serif text-[#2d3130] mt-2">
            Forging Your Tourigent Travel Ledger...
          </h2>
          <p className="text-xs font-mono text-[#9e472a] mt-3 font-semibold min-h-[36px] px-2 flex items-center justify-center border border-dashed border-[#b8860b] rounded bg-[#f5f0eb]">
            {statusMessage}
          </p>

          <div className="w-full bg-[#e3ded6] h-2 rounded-full mt-6 overflow-hidden border border-[#b8860b]">
            <div className="bg-[#22382c] h-full w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (guidebook) {
    return (
      <BookContainer
        guidebook={guidebook}
        onSwapStop={handleSwapStop}
        onCloseBook={() => setGuidebook(null)}
      />
    )
  }

  return <LandingPage onGenerateClick={handleGenerate} />
}

function createMockGuidebook(dest: string): GuidebookOutput {
  const city = dest || "Paris"
  return {
    id: "gb-mock-1",
    title: `Vintage Guidebook: ${city}`,
    subtitle: "A 3-Day Curated Journey for Nostalgic Travelers",
    destination: city,
    duration_days: 3,
    cover_stamp: {
      id: "stamp-cover-1",
      title: `Grand Tour of ${city}`,
      category: "Passport Seal",
      ink_color: "gold",
      rotation_deg: -3.5,
      earned_date: "1924-08-10",
    },
    hotels: [
      {
        id: "h1",
        name: `The Grand Heritage Hotel ${city}`,
        vintage_vibe: "1920s Belle Époque & Mahogany Lounge",
        address: `12 Rue de l'Ancien, ${city}`,
        price_per_night: "€180 - €240",
        rating: 4.9,
        perk: "Includes complimentary vintage afternoon tea & vinyl listening room",
      },
      {
        id: "h2",
        name: `L'Artisan Boutique Inn ${city}`,
        vintage_vibe: "Mid-Century Library & Garden Patio",
        address: `45 Via Antiqua, ${city}`,
        price_per_night: "€120 - €160",
        rating: 4.7,
        perk: "Handcrafted brass keycard & complimentary bicycle loan",
      },
    ],
    pages: [
      {
        day_number: 1,
        theme_title: `Secrets of Old ${city}`,
        date_label: "Day 1 Itinerary",
        ephemera_note: `Parchment notes gathered by vintage travelers in ${city}. Preserve ink signatures.`,
        stamps: [
          {
            id: "s1",
            title: "Heritage Pass",
            category: "Exploration",
            ink_color: "crimson",
            rotation_deg: 2.5,
            earned_date: "1924-08-10",
          },
        ],
        activities: [
          {
            id: "stop-1",
            time_slot: "09:00 AM — Morning Elixir & Bakery",
            title: `Café de l'Ombre in ${city}`,
            description:
              "A hidden courtyard cafe serving single-origin drip coffee poured into vintage porcelain cups.",
            category: "dining",
            location_name: `Old Town Quarter, ${city}`,
            lat: 48.8566,
            lng: 2.3522,
            estimated_cost: "€8 - €15",
            vintage_tip: "Ask the barista for the secret bookshop key behind the mirror.",
          },
          {
            id: "stop-2",
            time_slot: "11:30 AM — Antiquarian Browsing",
            title: "Cabinet of Curiosities",
            description:
              "Rare 19th-century maps, leatherbound travelogues, and hand-inked postcards.",
            category: "secret",
            location_name: `Artisan Passage, ${city}`,
            lat: 48.857,
            lng: 2.353,
            estimated_cost: "Free Entry",
            vintage_tip: "Check top drawer for 1950s transit tokens.",
          },
        ],
      },
      {
        day_number: 2,
        theme_title: "Artisan Guilds & Hidden Gardens",
        date_label: "Day 2 Itinerary",
        ephemera_note: "Quiet courtyards tucked behind iron gates.",
        stamps: [
          {
            id: "s2",
            title: "Artisan Seal",
            category: "Craftsmanship",
            ink_color: "navy",
            rotation_deg: -4.0,
            earned_date: "1924-08-11",
          },
        ],
        activities: [
          {
            id: "stop-3",
            time_slot: "02:00 PM — Glasshouse Walk",
            title: `${city} Botanical Conservatory`,
            description: "Ironwork pavilion designed in 1895 holding tropical flora.",
            category: "sight",
            location_name: `Parc Centenaire, ${city}`,
            lat: 48.858,
            lng: 2.354,
            estimated_cost: "€6",
            vintage_tip: "Sunlight hits stained glass at 3:45 PM.",
          },
        ],
      },
    ],
    created_at: new Date().toISOString(),
  }
}
