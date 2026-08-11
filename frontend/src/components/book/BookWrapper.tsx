"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Book as BookIcon,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Layers,
  X,
  Share2,
  Check,
} from "lucide-react"
import { GuidebookOutput, ActivityStop, StampBadge } from "@/types/guidebook"
import { GuidebookPage } from "./GuidebookPage"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Dynamically import react-pageflip for SSR compatibility
const HTML5FlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] bg-[#0f172a] rounded-2xl flex flex-col items-center justify-center text-[#f8fafc] border-4 border-[#334155] shadow-2xl">
      <Sparkles className="w-10 h-10 animate-spin text-[#38bdf8] mb-4" />
      <p className="font-serif text-lg">Unfolding Tourigent Travel Ledger...</p>
    </div>
  ),
})

import { SwapStopModal } from "./SwapStopModal"

interface BookWrapperProps {
  guidebook: GuidebookOutput
  onSwapStop?: (dayNumber: number, stopId: string, reason?: string) => Promise<void>
  onCloseBook?: () => void
}

export const BookWrapper: React.FC<BookWrapperProps> = ({
  guidebook: initialGuidebook,
  onSwapStop,
  onCloseBook,
}) => {
  const bookRef = useRef<any>(null)
  const [guidebook, setGuidebook] = useState<GuidebookOutput>(initialGuidebook)
  const [currentPage, setCurrentPage] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)
  const [swappingStopId, setSwappingStopId] = useState<string | null>(null)
  const [selectedStop, setSelectedStop] = useState<ActivityStop | null>(null)
  const [swapTarget, setSwapTarget] = useState<{
    dayNumber: number
    stopId: string
    title: string
  } | null>(null)

  useEffect(() => {
    setGuidebook(initialGuidebook)
  }, [initialGuidebook])

  useEffect(() => {
    setIsMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Left/Right Keyboard Arrow Listener for Page Flipping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        bookRef.current?.pageFlip()?.flipPrev()
      } else if (e.key === "ArrowRight") {
        bookRef.current?.pageFlip()?.flipNext()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Prepare Page Objects for the Flipbook Spreads
  const pagesList = useMemo(() => {
    const list: Array<{
      type: "cover" | "daily" | "hotels" | "stamps" | "backCover"
      dailyPageData?: any
    }> = [
      { type: "cover" },
    ]

    // Daily Pages
    guidebook.pages.forEach((page) => {
      list.push({ type: "daily", dailyPageData: page })
    })

    // Hotels Page
    if (guidebook.hotels && guidebook.hotels.length > 0) {
      list.push({ type: "hotels" })
    }

    // Stamps Vault Page
    const allStamps: StampBadge[] = [
      ...(guidebook.cover_stamp ? [guidebook.cover_stamp] : []),
      ...guidebook.pages.flatMap((p) => p.stamps || []),
    ]
    if (allStamps.length > 0) {
      list.push({ type: "stamps" })
    }

    // Back Cover Page
    list.push({ type: "backCover" })

    return list
  }, [guidebook])

  const totalBookPages = pagesList.length

  const handlePrevPage = () => {
    bookRef.current?.pageFlip()?.flipPrev()
  }

  const handleNextPage = () => {
    bookRef.current?.pageFlip()?.flipNext()
  }

  const handleOpenSwapModal = (dayNumber: number, stopId: string) => {
    let stopTitle = "Venue"
    for (const p of guidebook.pages) {
      if (p.day_number === dayNumber) {
        const found = p.activities.find((a) => a.id === stopId)
        if (found) stopTitle = found.title
      }
    }
    setSwapTarget({ dayNumber, stopId, title: stopTitle })
  }

  const handlePerformSwap = async (reason: string) => {
    if (!swapTarget) return
    const { dayNumber, stopId } = swapTarget
    setSwappingStopId(stopId)

    try {
      if (onSwapStop) {
        await onSwapStop(dayNumber, stopId, reason)
      } else {
        // Direct backend API call to /api/v1/guidebook/swap-stop
        const res = await fetch("http://localhost:8000/api/v1/guidebook/swap-stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guidebook_id: guidebook.id,
            day_number: dayNumber,
            stop_id: stopId,
            reason,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data && data.updated_stop) {
            setGuidebook((prev) => {
              const updatedPages = prev.pages.map((p) => {
                if (p.day_number === dayNumber) {
                  return {
                    ...p,
                    activities: p.activities.map((act) =>
                      act.id === stopId ? data.updated_stop : act
                    ),
                  }
                }
                return p
              })
              return { ...prev, pages: updatedPages }
            })
          }
        }
      }
    } catch (err) {
      console.error("Failed to swap stop:", err)
    } finally {
      setSwappingStopId(null)
      setSwapTarget(null)
    }
  }

  const handlePageFlip = (e: any) => {
    if (e && typeof e.data === "number") {
      setCurrentPage(e.data)
    }
  }

  return (
    <div className="min-h-screen bg-paper-texture p-4 md:p-8 flex flex-col justify-between select-none font-serif">
      {/* Top Header Navigation Toolbar */}
      <div className="max-w-6xl mx-auto w-full mb-6 flex flex-wrap items-center justify-between gap-4 bg-[#e2e8f0] border-2 border-[#94a3b8] p-3 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <BookIcon className="w-6 h-6 text-[#1e3a5f]" />
          <div>
            <h1 className="text-lg md:text-xl font-bold text-[#0f172a]">
              {guidebook.title}
            </h1>
            <p className="text-xs text-[#475569] font-sans">
              {guidebook.destination} • {guidebook.duration_days} Days Itinerary
            </p>
          </div>
        </div>

        {/* Center Page Turn Navigation */}
        <div className="flex items-center gap-2 font-sans">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="bg-[#f8fafc] border-[#94a3b8] text-[#0f172a] hover:bg-[#94a3b8]/20 gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </Button>

          <span className="text-xs font-serif font-bold text-[#1e3a5f] px-2">
            Page {currentPage + 1} / {totalBookPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalBookPages - 1}
            className="bg-[#f8fafc] border-[#94a3b8] text-[#0f172a] hover:bg-[#94a3b8]/20 gap-1 text-xs"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Keyboard Arrow Helper Badge & Return Button */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden lg:flex text-[10px] font-sans border-[#94a3b8] text-[#1e3a5f]">
            Use ← → arrow keys
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined" && guidebook?.id) {
                const shareUrl = `${window.location.origin}/guidebook/${guidebook.id}`
                navigator.clipboard.writeText(shareUrl)
                setCopiedShare(true)
                setTimeout(() => setCopiedShare(false), 2500)
              }
            }}
            className="bg-[#f5f0eb] border-[#b8860b] text-[#2d3130] hover:bg-[#b8860b]/20 text-xs gap-1 font-mono font-bold"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#22382c]" /> Copied Link!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#9e472a]" /> Share
              </>
            )}
          </Button>

          {onCloseBook && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCloseBook}
              className="text-xs font-sans text-[#b91c1c] hover:bg-[#b91c1c]/10 gap-1"
            >
              <X className="w-4 h-4" /> Close
            </Button>
          )}
        </div>
      </div>

      {/* Main PageFlip Book Canvas Container */}
      <div className="max-w-6xl mx-auto w-full flex-1 flex items-center justify-center relative min-h-[660px]">
        {/* Center Crease Shadow Gradient Layer across entire spread */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-16 pointer-events-none z-40 bg-gradient-to-r from-transparent via-black/15 to-transparent hidden md:block" />

        {isMounted && (
          // @ts-ignore
          <HTML5FlipBook
            ref={bookRef}
            width={isMobile ? 360 : 520}
            height={isMobile ? 580 : 660}
            size="stretch"
            minWidth={320}
            maxWidth={600}
            minHeight={500}
            maxHeight={750}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            usePortrait={isMobile}
            onFlip={handlePageFlip}
            className="shadow-2xl rounded-lg border border-[#b8a387]"
          >
            {pagesList.map((item, idx) => {
              const pageSide = idx % 2 === 0 ? "left" : "right"
              return (
                <GuidebookPage
                  key={idx}
                  pageNumber={idx + 1}
                  totalPages={totalBookPages}
                  pageSide={isMobile ? "single" : pageSide}
                  type={item.type}
                  dailyPageData={item.dailyPageData}
                  hotelsData={guidebook.hotels}
                  stampsData={[
                    ...(guidebook.cover_stamp ? [guidebook.cover_stamp] : []),
                    ...guidebook.pages.flatMap((p) => p.stamps || []),
                  ]}
                  bookTitle={guidebook.title}
                  bookSubtitle={guidebook.subtitle}
                  destination={guidebook.destination}
                  durationDays={guidebook.duration_days}
                  coverStamp={guidebook.cover_stamp}
                  onSwapStop={handleOpenSwapModal}
                  swappingStopId={swappingStopId}
                  onSelectStop={(stop) => setSelectedStop(stop)}
                />
              )
            })}
          </HTML5FlipBook>
        )}
      </div>

      {/* Popover Sticky Note Modal for Custom Swap Reasons */}
      <SwapStopModal
        isOpen={!!swapTarget}
        onClose={() => setSwapTarget(null)}
        onSubmit={handlePerformSwap}
        currentStopTitle={swapTarget?.title}
        dayNumber={swapTarget?.dayNumber}
      />

      {/* Shadcn Dialog for Inspecting Venue Stop Details */}
      <Dialog open={!!selectedStop} onOpenChange={(open) => !open && setSelectedStop(null)}>
        <DialogContent className="bg-[#f7f2e7] border-2 border-[#b8a387] font-serif text-[#2b180d] max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between text-xs font-sans text-[#7c4a27] mb-1">
              <span className="font-semibold">{selectedStop?.time_slot}</span>
              <Badge variant="stamp" className="stamp-navy text-[9px] uppercase">
                {selectedStop?.category}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold font-serif text-[#3d2314]">
              {selectedStop?.title}
            </DialogTitle>
            <DialogDescription className="font-sans text-xs text-[#5c351a] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#991b1b]" /> {selectedStop?.location_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 font-sans text-xs py-2">
            <div className="p-3 bg-[#fcfaf5] rounded border border-[#d4c3ab] text-[#3d2314] leading-relaxed">
              {selectedStop?.description}
            </div>

            {selectedStop?.vintage_tip && (
              <div className="p-3 bg-[#fbf8f1] rounded border border-[#e2d5c3]">
                <p className="margin-note text-sm text-[#1e3a8a]">
                  Insider Tip: {selectedStop.vintage_tip}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#d4c3ab] font-bold text-[#7c4a27]">
              <span>Estimated Cost:</span>
              <span className="text-sm">{selectedStop?.estimated_cost}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
