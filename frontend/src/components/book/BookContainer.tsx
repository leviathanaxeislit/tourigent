"use client"

import React, { useState } from "react"
import { Book, BookOpen, Calendar, MapPin, Compass } from "lucide-react"
import { GuidebookOutput } from "@/types/guidebook"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookWrapper } from "./BookWrapper"

interface BookContainerProps {
  guidebook: GuidebookOutput
  onSwapStop?: (dayNumber: number, stopId: string, reason?: string) => Promise<void>
  onCloseBook?: () => void
}

export const BookContainer: React.FC<BookContainerProps> = ({
  guidebook,
  onSwapStop,
  onCloseBook,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // Render Closed Tourigent Travel Ledger View
  if (!isOpen) {
    return (
      <div className="min-h-screen bg-topo-pattern flex flex-col items-center justify-center p-6 text-[#2d3130] font-sans select-none">
        <div className="max-w-md w-full field-ledger-card p-8 border-4 border-[#b8860b] shadow-2xl relative transform transition-transform hover:scale-105 duration-300 deckle-edge">
          {/* Brass Rivets */}
          <div className="absolute top-2 left-2 brass-rivet" />
          <div className="absolute top-2 right-2 brass-rivet" />
          <div className="absolute bottom-2 left-2 brass-rivet" />
          <div className="absolute bottom-2 right-2 brass-rivet" />

          <div className="border-2 border-dashed border-[#b8860b] p-6 rounded-sm text-center space-y-6 relative overflow-hidden bg-[#f5f0eb]">
            {guidebook.cover_stamp && (
              <div
                className="leather-stamp text-xs absolute top-2 right-2"
                style={{ transform: `rotate(${guidebook.cover_stamp.rotation_deg || 12}deg)` }}
              >
                {guidebook.cover_stamp.title}
              </div>
            )}

            <div className="pine-wax-seal w-16 h-16 mx-auto text-xl font-serif">
              <span>▲</span>
            </div>

            <div>
              <span className="leather-stamp-terracotta text-[10px]">
                TOURIGENT TRAVEL LEDGER
              </span>
              <h1 className="text-2xl font-bold font-serif text-[#2d3130] mt-2">
                {guidebook.title}
              </h1>
              <p className="text-xs font-mono text-[#5c6260] mt-2">
                {guidebook.subtitle}
              </p>
            </div>

            <Separator className="bg-[#b8860b]/40" />

            <div className="flex items-center justify-around font-mono text-xs text-[#22382c] font-bold">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#9e472a]" /> {guidebook.duration_days} Days Trip
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#9e472a]" /> {guidebook.destination}
              </span>
            </div>

            <Button
              onClick={() => setIsOpen(true)}
              className="w-full h-12 text-sm gap-2 bg-[#22382c] hover:bg-[#2d3130] text-[#f5f0eb] border-2 border-[#b8860b] font-serif uppercase tracking-wider font-bold shadow-md cursor-pointer"
            >
              <Compass className="w-5 h-5 text-[#b8860b] animate-spin" /> Unfold Tourigent Ledger
            </Button>
          </div>
        </div>

        {onCloseBook && (
          <Button
            variant="ghost"
            onClick={onCloseBook}
            className="mt-6 text-xs font-mono text-[#22382c] font-bold hover:text-[#9e472a] cursor-pointer"
          >
            ← Return to Tourigent Brief
          </Button>
        )}

      </div>
    )
  }

  // Render Interactive 3D Page Flip Guidebook Interface
  return (
    <BookWrapper
      guidebook={guidebook}
      onSwapStop={onSwapStop}
      onCloseBook={() => {
        setIsOpen(false)
        if (onCloseBook) onCloseBook()
      }}
    />
  )
}

