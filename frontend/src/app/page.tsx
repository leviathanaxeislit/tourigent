"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { LandingPage } from "@/components/landing/LandingPage"
import { BookContainer } from "@/components/book/BookContainer"
import { GuidebookOutput, GuidebookRequest } from "@/types/guidebook"
import { generateGuidebook, swapActivityStop, StatusUpdate } from "@/lib/api"

export default function Home() {
  const router = useRouter()
  const [guidebook, setGuidebook] = useState<GuidebookOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("Initializing LangGraph Tourist Agent Pipeline...")
  const [apiError, setApiError] = useState<string | null>(null)

  const handleGenerate = async (request: GuidebookRequest) => {
    setLoading(true)
    setApiError(null)
    setStatusMessage("Planning targeted venue searches & itinerary structure...")
    try {
      const data = await generateGuidebook(request, (update: StatusUpdate) => {
        if (update.message) {
          setStatusMessage(update.message)
        }
      })
      if (data?.id) {
        if (typeof window !== "undefined") {
          localStorage.setItem("tourigent_last_guidebook_id", data.id)
        }
        router.push(`/guidebook/${data.id}`)
      } else {
        setGuidebook(data)
      }
    } catch (e: any) {
      console.error("Backend API error:", e)
      setApiError(e.message || "Failed to generate vintage guidebook. Please ensure backend service is running.")
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
        onCloseBook={() => {
          setGuidebook(null)
          router.push("/")
        }}
      />
    )
  }

  return (
    <LandingPage
      onGenerateClick={handleGenerate}
      onOpenCachedLedger={(id) => router.push(`/guidebook/${id}`)}
      apiError={apiError}
      onClearError={() => setApiError(null)}
    />
  )
}
