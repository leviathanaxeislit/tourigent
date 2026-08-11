"use client"

import React, { forwardRef } from "react"
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  RefreshCw,
  Sparkles,
  Award,
  Info,
  Calendar,
  Building2,
  Bookmark,
  ExternalLink,
  Receipt,
  CreditCard,
} from "lucide-react"
import { DailyPage, HotelListing, StampBadge, ActivityStop, CostBreakup } from "@/types/guidebook"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FoldableMapInsert } from "@/components/map"

export interface GuidebookPageProps {
  pageNumber: number
  totalPages: number
  pageSide?: "left" | "right" | "single"
  type: "cover" | "daily" | "hotels" | "costs" | "stamps" | "backCover"
  dailyPageData?: DailyPage
  hotelsData?: HotelListing[]
  stampsData?: StampBadge[]
  bookTitle?: string
  bookSubtitle?: string
  destination?: string
  durationDays?: number
  coverStamp?: StampBadge
  costBreakup?: CostBreakup
  onSwapStop?: (dayNumber: number, stopId: string) => void
  swappingStopId?: string | null
  onSelectStop?: (stop: ActivityStop) => void
}

export const GuidebookPage = forwardRef<HTMLDivElement, GuidebookPageProps>(
  (
    {
      pageNumber,
      totalPages,
      pageSide = "right",
      type,
      dailyPageData,
      hotelsData = [],
      stampsData = [],
      bookTitle = "Travel Guidebook",
      bookSubtitle = "Vintage Ledger",
      destination = "Destination",
      durationDays = 3,
      coverStamp,
      costBreakup,
      onSwapStop,
      swappingStopId,
      onSelectStop,
    },
    ref
  ) => {
    // Determine inner crease shadow class based on page side
    const creaseClass =
      pageSide === "left"
        ? "right-0 bg-gradient-to-l from-black/15 via-black/5 to-transparent w-10"
        : pageSide === "right"
        ? "left-0 bg-gradient-to-r from-black/15 via-black/5 to-transparent w-10"
        : "left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent w-12"

    // Render Front Cover Page
    if (type === "cover") {
      return (
        <div
          ref={ref}
          className="page-node relative w-full h-full bg-[#0f172a] text-[#f8fafc] border-4 border-[#334155] p-8 flex flex-col justify-between select-none shadow-2xl overflow-hidden font-serif"
          data-density="hard"
        >
          {/* Outer Alpine Hairline Trim */}
          <div className="absolute inset-3 border-2 border-[#94a3b8]/60 pointer-events-none rounded-sm" />
          <div className="absolute inset-5 border border-[#94a3b8]/30 pointer-events-none rounded-sm" />

          {/* Cover Stamp */}
          {coverStamp && (
            <div
              className={`stamp-badge stamp-${coverStamp.ink_color || "gold"} absolute top-8 right-8 text-xs z-10 shadow-lg`}
              style={{ transform: `rotate(${coverStamp.rotation_deg || 12}deg)` }}
            >
              <Award className="w-3.5 h-3.5 mr-1 inline" />
              {coverStamp.title}
            </div>
          )}

          {/* Header Seal */}
          <div className="mt-8 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#1e293b] text-[#f8fafc] border-2 border-[#94a3b8] flex items-center justify-center shadow-inner">
              <Bookmark className="w-10 h-10 text-[#0284c7]" />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#94a3b8] font-sans font-semibold">
              Tourigent Guidebook • AI Tourist Agent Edition
            </p>
          </div>

          {/* Title Box */}
          <div className="my-auto text-center space-y-3 px-4">
            <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-wide text-[#f8fafc] drop-shadow-md leading-tight">
              {bookTitle}
            </h1>
            <div className="w-24 h-0.5 mx-auto bg-[#0284c7]" />
            <p className="text-sm italic text-[#cbd5e1] font-serif max-w-xs mx-auto">
              {bookSubtitle}
            </p>
          </div>

          {/* Footer Metadata */}
          <div className="mb-4 text-center space-y-2 font-sans text-xs text-[#cbd5e1]">
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#ea580c]" /> {durationDays} Days
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0284c7]" /> {destination}
              </span>
            </div>
            <p className="text-[10px] text-[#94a3b8]/70 uppercase tracking-widest">
              Unroll Map & Turn Page
            </p>
          </div>

          <div className="absolute bottom-2 right-4 text-[10px] text-[#94a3b8]/50 font-sans">
            Page {pageNumber}
          </div>
        </div>
      )
    }

    // Render Back Cover Page
    if (type === "backCover") {
      return (
        <div
          ref={ref}
          className="page-node relative w-full h-full bg-[#0f172a] text-[#f8fafc] border-4 border-[#334155] p-8 flex flex-col justify-between select-none shadow-2xl overflow-hidden font-serif"
          data-density="hard"
        >
          <div className="absolute inset-3 border-2 border-[#94a3b8]/60 pointer-events-none rounded-sm" />

          <div className="my-auto text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1e293b] border border-[#94a3b8] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#0284c7]" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-[#f8fafc]">Travel Ledger Complete</h2>
            <p className="text-xs text-[#cbd5e1] font-sans max-w-xs mx-auto">
              Safe travels on your journey through {destination}. May your memories stand the test of time.
            </p>
          </div>

          <div className="text-center font-sans text-[10px] text-[#94a3b8]/60">
            Tourigent Topographic Paper Guidebook System
          </div>

          <div className="absolute bottom-2 left-4 text-[10px] text-[#94a3b8]/50 font-sans">
            Page {pageNumber}
          </div>
        </div>
      )
    }

    // Render Standard Vintage Paper Pages (Daily Itinerary, Hotels, Passport Stamps)
    return (
      <div
        ref={ref}
        className="page-node relative w-full h-full bg-paper-texture border border-[#d4c3ab] p-6 md:p-8 flex flex-col justify-between shadow-md overflow-hidden select-none font-serif text-[#2b180d]"
        data-density="soft"
      >
        {/* Inner Crease Shadow Overlay */}
        <div className={`absolute top-0 bottom-0 pointer-events-none z-30 ${creaseClass}`} />

        {/* Vintage Outer Double Margin Rules */}
        <div className="absolute inset-3 border border-[#b8a387]/40 pointer-events-none rounded-sm" />
        <div className="absolute inset-4 border border-[#b8a387]/20 pointer-events-none rounded-sm" />

        {/* PAGE CONTENT SWITCHER */}
        <ScrollArea className="h-[calc(100%-2rem)] w-full pr-2">
          {/* TYPE 1: Daily Itinerary Page */}
          {type === "daily" && dailyPageData && (
            <div className="space-y-5">
              {/* Daily Header */}
              <div className="border-b-2 border-[#7c4a27]/80 pb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Badge variant="stamp" className="stamp-crimson text-[10px] mb-1">
                    Day {dailyPageData.day_number} • {dailyPageData.date_label}
                  </Badge>
                  <h2 className="text-xl md:text-2xl font-bold font-serif text-[#3d2314] leading-tight">
                    {dailyPageData.theme_title}
                  </h2>
                </div>

                {/* Day Stamps */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {dailyPageData.stamps?.map((stamp) => (
                    <Badge
                      key={stamp.id}
                      variant="stamp"
                      className={`stamp-badge stamp-${stamp.ink_color || "sepia"} text-[10px]`}
                      style={{ transform: `rotate(${stamp.rotation_deg || 0}deg)` }}
                    >
                      {stamp.title}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Handwritten Ink Ephemera Note */}
              {dailyPageData.ephemera_note && (
                <div className="p-3 bg-[#fbf8f1] rounded border border-[#e2d5c3] relative shadow-inner">
                  <p className="margin-note text-sm md:text-base text-[#1e3a8a]">
                    " {dailyPageData.ephemera_note} "
                  </p>
                </div>
              )}

              {/* Foldable Vintage Map Insert */}
              <FoldableMapInsert
                activities={dailyPageData.activities || []}
                destination={destination}
                dayNumber={dailyPageData.day_number}
              />

              {/* Activity Stops List */}
              <div className="space-y-4 pt-1">
                {dailyPageData.activities?.map((stop) => {
                  const isSwappingThis = swappingStopId === stop.id
                  return (
                    <Card
                      key={stop.id}
                      className="bg-[#fcfaf5] border-[#d4c3ab] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                      {/* Inline Typewriter Erasing / Vector Searching Loading Overlay */}
                      {isSwappingThis && (
                        <div className="absolute inset-0 bg-[#f7f2e7]/95 backdrop-blur-sm z-20 p-4 flex flex-col items-center justify-center text-center space-y-2 font-serif text-[#7c4a27] border-2 border-dashed border-[#991b1b]/50 rounded-lg animate-pulse">
                          <RefreshCw className="w-6 h-6 animate-spin text-[#991b1b]" />
                          <span className="font-bold text-sm tracking-wide">Erasing & Rewriting Venue...</span>
                          <span className="font-sans text-[10px] text-[#5c351a] italic">
                            Querying 768-dim embeddings & Qdrant vector memory
                          </span>
                        </div>
                      )}

                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between font-sans text-xs text-muted-foreground">
                          <span className="font-semibold text-[#7c4a27] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {stop.time_slot}
                          </span>

                          {/* Venue category tag in Shadcn Badge with rotated stamp border */}
                          <Badge
                            variant="stamp"
                            className="stamp-badge stamp-navy text-[9px] py-0 px-2 rotate-[-2deg] capitalize"
                          >
                            {stop.category}
                          </Badge>
                        </div>

                        <CardTitle className="font-serif text-base font-bold text-[#3d2314] mt-1 group-hover:text-[#991b1b] transition-colors">
                          {stop.title}
                        </CardTitle>

                        <CardDescription className="font-sans text-xs text-[#5c351a] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#991b1b]" /> {stop.location_name}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-4 pt-0 font-sans text-xs text-muted-foreground space-y-2">
                        <p className="leading-relaxed text-[#3d2314]/90">{stop.description}</p>

                        {/* Handwritten Ink Margin Annotation */}
                        {stop.vintage_tip && (
                          <div className="pt-1 border-t border-[#e2d5c3]/60">
                            <p className="margin-note text-xs text-[#1e3a8a] flex items-start gap-1">
                              <span className="font-sans font-bold text-[10px] uppercase text-[#7c4a27] not-italic">Note:</span>
                              {stop.vintage_tip}
                            </p>
                          </div>
                        )}
                      </CardContent>

                      {/* Card Footer Action Strip */}
                      <div className="px-4 py-2 bg-[#f7f2e7] border-t border-[#e2d5c3] flex items-center justify-between font-sans text-xs">
                        <span className="font-semibold text-[#7c4a27] flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3" /> {stop.estimated_cost}
                        </span>

                        <div className="flex items-center gap-2">
                          {stop.google_maps_url && (
                            <a
                              href={stop.google_maps_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-6 px-1.5 text-[10px] text-[#9e472a] hover:bg-[#9e472a]/10 rounded font-sans inline-flex items-center gap-1 border border-[#9e472a]/30 font-semibold"
                            >
                              <ExternalLink className="w-2.5 h-2.5 text-[#9e472a]" /> Maps
                            </a>
                          )}
                          {stop.tripadvisor_url && (
                            <a
                              href={stop.tripadvisor_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-6 px-1.5 text-[10px] text-[#00af87] hover:bg-[#00af87]/10 rounded font-sans inline-flex items-center gap-1 border border-[#00af87]/30 font-semibold"
                            >
                              <ExternalLink className="w-2.5 h-2.5 text-[#00af87]" /> Reviews
                            </a>
                          )}

                          {onSelectStop && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onSelectStop(stop)}
                                    className="h-6 px-2 text-[11px] text-[#3d2314] hover:bg-[#b8a387]/20"
                                  >
                                    <Info className="w-3 h-3 mr-1" /> Details
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="font-sans text-xs bg-[#3d2314] text-[#f7f2e7]">
                                  Inspect venue details & map info
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          {onSwapStop && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSwapStop(dailyPageData.day_number, stop.id)}
                              disabled={isSwappingThis}
                              className="h-6 px-2 text-[11px] text-[#991b1b] hover:text-[#7f1d1d] hover:bg-[#991b1b]/10 gap-1"
                            >
                              <RefreshCw className={`w-3 h-3 ${isSwappingThis ? "animate-spin" : ""}`} />
                              Swap Stop
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* TYPE 2: Hotel Recommendations Page (Clipped Receipts/Ticket Stubs) */}
          {type === "hotels" && (
            <div className="space-y-5">
              <div className="border-b-2 border-[#1e3a5f]/80 pb-3">
                <Badge variant="stamp" className="stamp-gold text-[10px] mb-1">
                  Curated Accommodations
                </Badge>
                <h2 className="text-xl md:text-2xl font-bold font-serif text-[#0f172a]">
                  Boutique Hotels & Heritage Vouchers
                </h2>
              </div>

              {/* Receipt / Stub Grid */}
              <div className="space-y-4">
                {hotelsData.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="receipt-stub bg-[#f8fafc] border-2 border-[#cbd5e1] p-4 text-xs font-mono relative shadow-md space-y-2 text-[#0f172a]"
                  >
                    {/* Top Ticket Perforation Bar */}
                    <div className="flex items-center justify-between border-b border-dashed border-[#94a3b8] pb-2 font-sans">
                      <span className="font-bold text-[10px] tracking-widest text-[#1e3a5f] uppercase flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#0369a1]" /> Hotel Guest Voucher
                      </span>
                      <div className="flex items-center gap-0.5 text-[#c2410c]">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-semibold text-xs">{hotel.rating} / 5</span>
                      </div>
                    </div>

                    {/* Main Receipt Content */}
                    <div className="space-y-1 font-serif">
                      <h3 className="font-bold text-base text-[#0f172a]">{hotel.name}</h3>
                      <p className="font-sans text-[11px] text-[#475569] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#c2410c]" /> {hotel.address}
                      </p>
                    </div>

                    <div className="font-sans text-xs bg-[#f1f5f9] p-2 rounded border border-[#cbd5e1] space-y-1">
                      <span className="font-bold text-[#1e3a5f]">Vintage Vibe & Atmosphere:</span>
                      <p className="italic text-[#0f172a]">{hotel.vintage_vibe}</p>
                    </div>

                    {/* Receipt Perk */}
                    <div className="font-sans text-[11px] text-[#c2410c] flex items-center justify-between pt-1">
                      <span className="font-semibold">Exclusive Perk: {hotel.perk}</span>
                      <span className="font-mono font-bold text-sm text-[#0f172a]">{hotel.price_per_night}</span>
                    </div>

                    {/* Verified Traveler Review Snippet */}
                    {hotel.reviews && hotel.reviews.length > 0 && (
                      <div className="font-sans text-[11px] bg-[#fdfbf7] p-2.5 rounded border border-[#e2d5c3] space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#7c4a27] font-bold">
                          <span>Verified Review ({hotel.reviews[0].source})</span>
                          <span className="flex items-center gap-0.5 text-[#c2410c]">
                            <Star className="w-2.5 h-2.5 fill-current" /> {hotel.reviews[0].rating}
                          </span>
                        </div>
                        <p className="italic text-[#3d2314]">"{hotel.reviews[0].text}"</p>
                        <p className="text-[10px] text-muted-foreground text-right">— {hotel.reviews[0].author}</p>
                      </div>
                    )}

                    {/* Ticket Stub Deep Links */}
                    <div className="pt-2 flex items-center justify-end gap-2 font-sans">
                      {hotel.booking_url && (
                        <a
                          href={hotel.booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 px-2.5 rounded bg-[#1e3a5f] hover:bg-[#0f2942] text-[#f8fafc] text-[11px] font-semibold inline-flex items-center gap-1 border border-[#94a3b8]"
                        >
                          <ExternalLink className="w-3 h-3 text-[#b8860b]" /> Reserve on Booking.com
                        </a>
                      )}
                      {hotel.tripadvisor_url && (
                        <a
                          href={hotel.tripadvisor_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 px-2.5 rounded bg-[#00af87] hover:bg-[#008f6e] text-white text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3 text-white" /> TripAdvisor
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TYPE 3: Expedition Financial Ledger & Cost Breakup Page */}
          {type === "costs" && (
            <div className="space-y-5">
              <div className="border-b-2 border-[#b8860b] pb-3">
                <Badge variant="stamp" className="stamp-badge stamp-gold text-[10px] mb-1">
                  Treasury Ledger
                </Badge>
                <h2 className="text-xl md:text-2xl font-bold font-serif text-[#2d3130]">
                  Expedition Cost Breakup
                </h2>
                <p className="text-xs font-mono text-[#9e472a] mt-0.5">
                  Itemized Financial Estimates for {destination} ({durationDays} Days)
                </p>
              </div>

              {costBreakup ? (
                <div className="field-ledger-card p-4 border-2 border-[#b8860b] bg-[#f5f0eb] space-y-4 rounded shadow-sm text-xs font-mono">
                  <div className="border-b border-dashed border-[#b8860b] pb-2 flex justify-between font-bold text-[#22382c]">
                    <span>EXPEDITION CATEGORY</span>
                    <span>ESTIMATED RANGE</span>
                  </div>

                  <div className="space-y-2.5 text-[#2d3130]">
                    <div className="flex justify-between items-center bg-[#e3ded6]/60 p-2 rounded border border-[#b8860b]/30">
                      <span className="font-semibold">🏨 Accommodations (Hotels)</span>
                      <span className="font-bold text-[#22382c]">{costBreakup.hotels_total}</span>
                    </div>

                    <div className="flex justify-between items-center bg-[#e3ded6]/60 p-2 rounded border border-[#b8860b]/30">
                      <span className="font-semibold">🍽️ Dining & Local Cafes</span>
                      <span className="font-bold text-[#22382c]">{costBreakup.dining_total}</span>
                    </div>

                    <div className="flex justify-between items-center bg-[#e3ded6]/60 p-2 rounded border border-[#b8860b]/30">
                      <span className="font-semibold">🎟️ Activity Fees & Entry</span>
                      <span className="font-bold text-[#22382c]">{costBreakup.activities_total}</span>
                    </div>

                    <div className="flex justify-between items-center bg-[#e3ded6]/60 p-2 rounded border border-[#b8860b]/30">
                      <span className="font-semibold">🚃 Local Transit & Metro</span>
                      <span className="font-bold text-[#22382c]">{costBreakup.transport_total}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-[#b8860b] flex justify-between items-center text-sm font-bold text-[#9e472a]">
                    <span>ESTIMATED GRAND TOTAL</span>
                    <span className="text-base font-serif bg-[#22382c] text-[#f5f0eb] px-3 py-1 border-2 border-[#b8860b] rounded">
                      {costBreakup.grand_total}
                    </span>
                  </div>

                  {costBreakup.savings_tip && (
                    <div className="p-3 bg-[#fbf8f1] border border-dashed border-[#b8860b] rounded">
                      <p className="margin-note text-xs text-[#1e3a8a]">
                        <span className="font-sans font-bold text-[#9e472a] uppercase not-italic">Ledger Tip: </span>
                        {costBreakup.savings_tip}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-[#fbf8f1] border border-dashed border-[#b8860b] text-center font-mono text-xs text-[#5c6260]">
                  Cost breakup details being computed for {destination}...
                </div>
              )}
            </div>
          )}

          {/* TYPE 4: Passport Stamps Vault Page */}
          {type === "stamps" && (
            <div className="space-y-5">
              <div className="border-b-2 border-[#1e3a5f]/80 pb-3">
                <Badge variant="stamp" className="stamp-emerald text-[10px] mb-1">
                  Tourigent Passport Vault
                </Badge>
                <h2 className="text-xl md:text-2xl font-bold font-serif text-[#0f172a]">
                  Passport Seals & Waypoint Stamps
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {stampsData.map((stamp, idx) => (
                  <div
                    key={stamp.id || idx}
                    className="p-4 bg-[#fcfaf5] rounded-lg border-2 border-dashed border-[#b8a387] flex flex-col items-center justify-center space-y-2 text-center shadow-sm"
                  >
                    <div
                      className={`stamp-badge stamp-${stamp.ink_color || "sepia"} text-xs`}
                      style={{ transform: `rotate(${stamp.rotation_deg || 0}deg)` }}
                    >
                      {stamp.title}
                    </div>
                    <span className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider">
                      {stamp.category} • {stamp.earned_date || "Validated"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* PAGE FOOTER NUMERATION */}
        <div className="pt-2 border-t border-[#d4c3ab]/60 flex items-center justify-between font-sans text-[11px] text-[#7c4a27]">
          <span>Tourigent Voyage</span>
          <span className="font-semibold font-serif">Page {pageNumber} of {totalPages}</span>
        </div>
      </div>
    )
  }
)

GuidebookPage.displayName = "GuidebookPage"
