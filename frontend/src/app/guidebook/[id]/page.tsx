"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { BookContainer } from "@/components/book/BookContainer"
import { GuidebookOutput } from "@/types/guidebook"
import { fetchGuidebookById, swapActivityStop } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Sparkles, AlertCircle, ArrowLeft } from "lucide-react"

export default function GuidebookSharePage() {
  const params = useParams()
  const router = useRouter()
  const guidebookId = params?.id as string

  const [guidebook, setGuidebook] = useState<GuidebookOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!guidebookId) return

    async function loadGuidebook() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchGuidebookById(guidebookId)
        setGuidebook(data)
        if (typeof window !== "undefined" && data?.id) {
          localStorage.setItem("tourigent_last_guidebook_id", data.id)
        }
      } catch (err: any) {
        console.error("Error loading shareable guidebook:", err)
        setError(err.message || `Guidebook with ID '${guidebookId}' not found.`)
      } finally {
        setLoading(false)
      }
    }

    loadGuidebook()
  }, [guidebookId])

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
        <div className="field-ledger-card p-8 border-4 border-[#b8860b] shadow-2xl rounded-sm max-w-md w-full text-center relative deckle-edge bg-[#f5f0eb]">
          <div className="absolute top-2 left-2 brass-rivet" />
          <div className="absolute top-2 right-2 brass-rivet" />

          <div className="pine-wax-seal w-16 h-16 mx-auto mb-4 animate-bounce">
            <Sparkles className="w-8 h-8 text-[#f5f0eb]" />
          </div>

          <span className="leather-stamp text-xs mb-2">TOURIGENT TRAVEL LEDGER</span>

          <h2 className="text-xl font-bold font-serif text-[#2d3130] mt-2">
            Opening Shared Travel Guidebook...
          </h2>
          <p className="text-xs font-mono text-[#9e472a] mt-3 font-semibold border border-dashed border-[#b8860b] p-2 rounded">
            ID: {guidebookId}
          </p>

          <div className="w-full bg-[#e3ded6] h-2 rounded-full mt-6 overflow-hidden border border-[#b8860b]">
            <div className="bg-[#22382c] h-full w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !guidebook) {
    return (
      <div className="min-h-screen bg-topo-pattern flex flex-col items-center justify-center p-6 text-[#2d3130] font-sans">
        <div className="field-ledger-card p-8 border-4 border-[#9e472a] shadow-2xl rounded-sm max-w-md w-full text-center relative deckle-edge bg-[#f5f0eb]">
          <div className="absolute top-2 left-2 brass-rivet" />
          <div className="absolute top-2 right-2 brass-rivet" />

          <AlertCircle className="w-12 h-12 mx-auto text-[#9e472a] mb-4" />
          <span className="leather-stamp-terracotta text-xs mb-2">GUIDEBOOK NOT FOUND</span>

          <h2 className="text-xl font-bold font-serif text-[#2d3130] mt-2">
            Parchment Record Unavailable
          </h2>
          <p className="text-xs font-mono text-[#5c6260] mt-3 border border-dashed border-[#9e472a]/40 p-3 rounded">
            {error || "The requested guidebook ledger could not be found or has expired."}
          </p>

          <Button
            onClick={() => router.push("/")}
            className="mt-6 w-full h-11 bg-[#22382c] hover:bg-[#2d3130] text-[#f5f0eb] border-2 border-[#b8860b] font-serif uppercase tracking-wider text-xs gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Tourigent Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <BookContainer
      guidebook={guidebook}
      onSwapStop={handleSwapStop}
      onCloseBook={() => router.push("/")}
    />
  )
}
