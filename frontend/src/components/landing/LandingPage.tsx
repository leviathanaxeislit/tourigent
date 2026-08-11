"use client"

import React, { useState, useEffect } from "react"
import { Compass, MapPin, Sparkles, BookOpen, Clock, Award, ChevronRight, CheckCircle2, Bookmark, Star, Calendar, Map, Mountain, Layers, Globe, Palmtree } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { ElevationAscentRoute } from "@/components/book/ElevationAscentRoute"
import { UnfoldingTrailMapModal } from "@/components/book/UnfoldingTrailMapModal"

import { GuidebookOutput, GuidebookRequest } from "@/types/guidebook"

import { Logo } from "@/components/brand/Logo"

interface LandingPageProps {
  onGenerateClick?: (request: GuidebookRequest) => void
  onOpenCachedLedger?: (guidebookId: string) => void
  apiError?: string | null
  onClearError?: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGenerateClick,
  onOpenCachedLedger,
  apiError,
  onClearError,
}) => {
  const [destination, setDestination] = useState("Paris")
  const [duration, setDuration] = useState("3")
  const [travelStyle, setTravelStyle] = useState("Vintage Explorer")
  const [budget, setBudget] = useState("Moderate")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Architecture",
    "Hidden Cafes",
    "Antiques",
  ])
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [cachedGuidebookId, setCachedGuidebookId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("tourigent_last_guidebook_id")
      if (savedId && !savedId.startsWith("gb-mock-")) {
        setCachedGuidebookId(savedId)
      }
    }
  }, [])

  const interestOptions = [
    "Architecture",
    "Hidden Cafes",
    "Antiques",
    "Artisan Workshops",
    "Historic Landmarks",
    "Local Cuisine",
    "Secret Gardens",
  ]

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  const handleNavbarCtaClick = () => {
    if (cachedGuidebookId) {
      if (onOpenCachedLedger) {
        onOpenCachedLedger(cachedGuidebookId)
      } else {
        window.location.href = `/guidebook/${cachedGuidebookId}`
      }
      return
    }

    const el = document.getElementById("destination-input")
    if (el) {
      el.focus()
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onGenerateClick) {
      onGenerateClick({
        destination: destination.trim() || "Paris",
        duration_days: Math.max(1, Math.min(14, parseInt(duration) || 3)),
        travel_style: travelStyle,
        budget: budget,
        interests: selectedInterests.length > 0 ? selectedInterests : ["Architecture", "Hidden Cafes"],
      })
    }
  }

  const faqs = [
    {
      q: "What types of trips and tours does Tourigent support?",
      a: "Tourigent is your AI Tourist Agent for all holidays worldwide — city walking tours, beach resort escapes, historic heritage routes, mountain treks, foodie crawls, and multi-day vacations."
    },
    {
      q: "How are venue details and itinerary stops verified?",
      a: "Every cafe, historic monument, museum, and local shop is live-checked for exact opening hours, current ticket tariffs, insider entry tips, and map coordinates so your trip runs smoothly."
    },
    {
      q: "What makes Tourigent travel ledgers unique?",
      a: "Rigid digital lists are replaced by handcrafted skeuomorphic paper ledgers featuring raw deckle edges, brass compass rivets, custom passport seals, margin fountain-pen notes, and unfolding canvas maps."
    },
    {
      q: "Can I swap individual stops on my daily itinerary?",
      a: "Yes! Use the 'Swap Stop' feature to instantly suggest curated alternatives nearby that match your personal travel pace and interest."
    }
  ]

  return (
    <div className="min-h-screen bg-topo-pattern text-[#2d3130] font-sans selection:bg-[#22382c] selection:text-[#f5f0eb]">
      {/* Tourigent Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f5f0eb]/90 border-b-2 border-[#b8860b]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size={42} />

          <nav className="hidden md:flex items-center gap-8 font-mono text-xs font-bold uppercase tracking-wider text-[#5c6260]">
            <a href="#hero" className="hover:text-[#22382c] transition-colors">Trip Brief</a>
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="hover:text-[#9e472a] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Map className="w-3.5 h-3.5 text-[#b8860b]" /> Unfold Canvas Map
            </button>
            <a href="#route" className="hover:text-[#22382c] transition-colors">Itinerary Flow</a>
            <a href="#features" className="hover:text-[#22382c] transition-colors">Craftsmanship</a>
            <a href="#faq" className="hover:text-[#22382c] transition-colors">FAQ</a>
          </nav>

          <Button
            onClick={handleNavbarCtaClick}
            className="group gap-2 bg-[#22382c] hover:bg-[#1a2e23] text-[#f5f0eb] border-2 border-[#b8860b] font-serif shadow-md hover:shadow-lg text-xs tracking-wider uppercase font-bold cursor-pointer transition-all active:scale-[0.98]"
          >
            {cachedGuidebookId ? (
              <>
                <BookOpen className="w-4 h-4 text-[#b8860b] group-hover:scale-110 transition-transform" />
                <span>Open Saved Ledger</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#b8860b] group-hover:rotate-12 transition-transform" />
                <span>Craft Expedition</span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-[#b8860b] opacity-80 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative py-12 lg:py-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Form Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="leather-stamp text-xs">
                <span>TOURIGENT APPROVED</span>
                <span className="text-[#b8860b]">★</span>
                <span>ALL TOURS & TRIPS</span>
              </span>
              <span className="leather-stamp-terracotta text-xs">
                AI TOURIST AGENT
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#2d3130] leading-[1.15] tracking-tight">
              Tourigent <br />
              <span className="text-[#9e472a] underline decoration-[#b8860b] decoration-dashed underline-offset-8">
                Vintage Travel Ledger
              </span>
            </h1>

            <p className="text-base md:text-lg text-[#5c6260] font-sans leading-relaxed max-w-2xl">
              Your AI Tourist Agent for all holidays, city breaks, and world tours. Replace generic app lists with a handcrafted travel ledger complete with deckle-edge paper, brass rivets, custom passport seals, margin notes, and unfolding canvas maps.
            </p>

            {/* Prompt Ledger Card */}
            <div className="field-ledger-card p-6 rounded-sm deckle-edge relative">
              <div className="paperclip-anchor" />
              <div className="absolute top-2 left-2 brass-rivet" />
              <div className="absolute top-2 right-2 brass-rivet" />

              <div className="mb-4 pb-3 border-b border-dashed border-[#b8860b] flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-[#2d3130] font-bold uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#9e472a]" /> Forge Your Personalized Trip
                  </h3>
                  <p className="font-mono text-xs text-[#5c6260]">Enter any destination worldwide — city, island, heritage town, or mountain pass</p>
                </div>
                <div className="pine-wax-seal text-xs font-mono font-bold">SEAL</div>
              </div>

              {apiError && (
                <div className="mb-4 p-3 border-2 border-[#9e472a] bg-[#f5f0eb] rounded text-xs font-mono text-[#9e472a] flex items-center justify-between shadow-xs">
                  <span>⚠️ {apiError}</span>
                  {onClearError && (
                    <button type="button" onClick={onClearError} className="underline font-bold cursor-pointer ml-2">
                      Dismiss
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-mono font-bold text-[#22382c] uppercase tracking-wider">
                      Destination City / Holiday Region
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#9e472a]" />
                      <Input
                        id="destination-input"
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g. Paris, Tokyo, Venice, Kyoto, Leh, Bali, London"
                        className="pl-9 bg-[#f5f0eb] border-2 border-[#b8860b] font-mono text-sm font-bold text-[#2d3130] focus-visible:ring-[#22382c]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-[#22382c] uppercase tracking-wider">
                      Trip Days
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={14}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="bg-[#f5f0eb] border-2 border-[#b8860b] font-mono text-sm text-center font-bold text-[#2d3130] focus-visible:ring-[#22382c]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-[#22382c] uppercase tracking-wider">
                      Travel Style
                    </label>
                    <select
                      value={travelStyle}
                      onChange={(e) => setTravelStyle(e.target.value)}
                      className="w-full h-10 px-3 bg-[#f5f0eb] border-2 border-[#b8860b] font-mono text-xs font-bold text-[#2d3130] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#22382c]"
                    >
                      <option value="Vintage Explorer">Vintage Explorer</option>
                      <option value="Historic Heritage">Historic Heritage</option>
                      <option value="Speakeasy & Gastronomy">Speakeasy & Gastronomy</option>
                      <option value="Artisan & Antiques">Artisan & Antiques</option>
                      <option value="Scenic Escape">Scenic Escape</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-[#22382c] uppercase tracking-wider">
                      Budget Level
                    </label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full h-10 px-3 bg-[#f5f0eb] border-2 border-[#b8860b] font-mono text-xs font-bold text-[#2d3130] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#22382c]"
                    >
                      <option value="Budget">Budget (€)</option>
                      <option value="Moderate">Moderate (€€)</option>
                      <option value="Luxury">Luxury (€€€)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#22382c] uppercase tracking-wider block">
                    Curated Interests (Select Any):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {interestOptions.map((item) => {
                      const isSelected = selectedInterests.includes(item)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleInterest(item)}
                          className={`text-xs px-2.5 py-1 rounded-sm border font-mono transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#22382c] text-[#f5f0eb] border-[#b8860b] font-bold shadow-xs"
                              : "bg-[#e3ded6]/60 text-[#5c6260] border-[#b8860b]/40 hover:bg-[#e3ded6]"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}{item}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-sm gap-2 bg-[#22382c] hover:bg-[#2d3130] text-[#f5f0eb] border-2 border-[#b8860b] font-serif uppercase tracking-wider font-bold shadow-lg cursor-pointer"
                  >
                    <Compass className="w-5 h-5 text-[#b8860b]" /> Create Tourigent Guidebook
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="h-12 px-4 bg-[#9e472a] hover:bg-[#b8860b] text-[#f5f0eb] border-2 border-[#b8860b] font-mono text-xs uppercase font-bold tracking-wider cursor-pointer"
                  >
                    <Map className="w-4 h-4 mr-1" /> Unfold Canvas Map
                  </Button>
                </div>
              </form>

              <div className="mt-4 pt-3 border-t border-dashed border-[#b8860b] flex flex-wrap items-center justify-between text-xs font-mono text-[#5c6260]">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#22382c]" /> Live Verified Details</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#22382c]" /> Tailored Route Engine</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#22382c]" /> Interactive 3D Journal</span>
              </div>
            </div>
          </div>

          {/* Right Column: Stacked & Overlapping Parchment Cards */}
          <div id="preview" className="lg:col-span-5 relative space-y-4 pt-4 lg:pt-0">
            <div className="text-xs font-mono text-[#9e472a] font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-[#b8860b]" /> Tourigent Sample Ledger Slips
            </div>

            {/* Overlapping Parchment Note 1 */}
            <div className="field-ledger-card p-5 rounded-sm deckle-edge rotate-[-2deg] shadow-lg relative border-2 border-[#b8860b]">
              <div className="absolute top-2 right-2 brass-rivet" />
              <span className="leather-stamp text-[10px] absolute -top-3 left-4">
                MORNING • PARIS
              </span>
              <h4 className="font-serif font-bold text-lg text-[#2d3130] mt-1">Hidden Courtyard Bakery & Porcelain Elixir</h4>
              <p className="text-xs font-mono text-[#5c6260] mt-1">Single-origin drip espresso & freshly baked almond croissants.</p>
              <div className="margin-note text-xs mt-2">✎ "Ask for secret garden seating behind mirror."</div>
            </div>

            {/* Overlapping Parchment Note 2 (Shifted Right) */}
            <div className="field-ledger-card p-5 rounded-sm deckle-edge rotate-[1.5deg] translate-x-3 shadow-xl relative border-2 border-[#b8860b] bg-[#e3ded6]/80">
              <div className="absolute top-2 left-2 brass-rivet" />
              <span className="leather-stamp-terracotta text-[10px] absolute -top-3 right-4">
                AFTERNOON • KYOTO
              </span>
              <h4 className="font-serif font-bold text-lg text-[#2d3130] mt-1">19th-Century Antiquarian Passage & Bamboo Walk</h4>
              <p className="text-xs font-mono text-[#5c6260] mt-1">Heirloom maps, woodblock prints, and matcha tea house.</p>
            </div>

            {/* Overlapping Parchment Note 3 (Stacked Below) */}
            <div className="field-ledger-card p-5 rounded-sm deckle-edge rotate-[-1deg] shadow-md relative border-2 border-[#b8860b]">
              <div className="paperclip-anchor" />
              <span className="leather-stamp text-[10px]">
                PASSPORT SEAL • VERIFIED
              </span>
              <p className="font-mono text-xs text-[#22382c] font-bold mt-2">
                "Curated by Tourigent AI Tourist Agent"
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Itinerary Route Flow Section */}
      <section id="route" className="py-8 px-6 max-w-7xl mx-auto">
        <ElevationAscentRoute
          onWaypointClick={(wp) => {
            setIsMapModalOpen(true)
          }}
        />
      </section>

      <Separator className="max-w-7xl mx-auto opacity-40 bg-[#b8860b]" />

      {/* Product Feature Section */}
      <section id="features" className="py-16 px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="leather-stamp text-xs">
            TOURIST AGENT ENGINE
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2d3130]">
            Handcrafted Artistry for All World Tours
          </h2>
          <p className="text-[#5c6260] font-sans text-sm">
            Designed for curious travelers who value authentic paper design, real venue verification, and effortless trip customization.
          </p>
        </div>

        {/* 3 Column Stacked Equipment Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="field-ledger-card p-6 deckle-edge relative border-2 border-[#b8860b]">
            <div className="absolute top-2 left-2 brass-rivet" />
            <div className="pine-wax-seal mb-3">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#2d3130] mb-2">Live Verified Venues</h3>
            <p className="font-sans text-xs text-[#5c6260] leading-relaxed">
              Every restaurant, boutique, museum, and scenic viewpoint is live-checked for opening hours, ticket pricing, and exact location.
            </p>
          </div>

          <div className="field-ledger-card p-6 deckle-edge relative border-2 border-[#b8860b] rotate-[0.5deg]">
            <div className="absolute top-2 right-2 brass-rivet" />
            <div className="pine-wax-seal mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#2d3130] mb-2">All Tours & Holiday Types</h3>
            <p className="font-sans text-xs text-[#5c6260] leading-relaxed">
              Whether you are planning a Paris city walk, Kyoto heritage trail, Bali beach retreat, or island holiday — Tourigent tailors every detail.
            </p>
          </div>

          <div className="field-ledger-card p-6 deckle-edge relative border-2 border-[#b8860b] rotate-[-0.5deg]">
            <div className="paperclip-anchor" />
            <div className="pine-wax-seal mb-3">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#2d3130] mb-2">Unfolding Canvas Maps</h3>
            <p className="font-sans text-xs text-[#5c6260] leading-relaxed">
              Popups expand outward as multi-panel accordion canvas map containers with brass rivets, cartography grids, and custom seals.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section id="faq" className="py-16 px-6 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="leather-stamp-terracotta text-xs">
            TOURIGENT KNOWLEDGE BASE
          </span>
          <h2 className="text-3xl font-serif font-bold text-[#2d3130]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="field-ledger-card p-6 border-2 border-[#b8860b] deckle-edge">
          <div className="divide-y divide-[#b8860b]/40">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger
                  isOpen={openFaq === idx}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="font-serif text-base font-bold text-[#2d3130] hover:text-[#9e472a]"
                >
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent isOpen={openFaq === idx} className="font-mono text-xs leading-relaxed text-[#5c6260]">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#b8860b] py-10 bg-[#e3ded6] text-center font-mono text-xs text-[#5c6260]">
        <div className="max-w-7xl mx-auto px-6 space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#22382c] font-serif font-bold text-base">
            <span className="brass-rivet" /> TOURIGENT — AI TOURIST AGENT & VINTAGE TRAVEL LEDGER
          </div>
          <p>© 2026 Tourigent Inc. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Accordion Unfolding Trail Map Canvas Modal */}
      <UnfoldingTrailMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title={`${destination} Tourigent Topographical Map`}
        subtitle="3-Panel Accordion Canvas Fold • Curated Travel Stops"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-dashed border-[#b8860b] pb-2">
            <span className="font-bold text-[#22382c]">STOP ALPHA: HISTORIC QUARTER</span>
            <span className="text-[#9e472a] font-bold">STAGE 1</span>
          </div>
          <p className="text-[#5c6260]">
            Morning bakery, single-origin porcelain espresso, and antiquarian bookshops.
          </p>

          <div className="flex items-center justify-between border-b border-dashed border-[#b8860b] pb-2 pt-2">
            <span className="font-bold text-[#22382c]">STOP BETA: SUNSET PANORAMA</span>
            <span className="text-[#9e472a] font-bold">STAGE 3</span>
          </div>
          <p className="text-[#5c6260]">
            Elevated garden outlook with panoramic sunset views and subterranean lounge dining.
          </p>

          <div className="p-3 bg-[#e3ded6] border border-[#b8860b] rounded-sm mt-4">
            <span className="margin-note text-sm">
              ✎ "All venue opening times and admission details live-verified for Tourigent travelers."
            </span>
          </div>
        </div>
      </UnfoldingTrailMapModal>
    </div>
  )
}
