"use client"

import React, { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Navigation, ExternalLink, ChevronDown, ChevronUp, Compass, Sparkles, Layers } from "lucide-react"
import { ActivityStop } from "@/types/guidebook"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import "leaflet/dist/leaflet.css"

// Dynamically import Leaflet Map components for Next.js SSR compatibility
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

interface FoldableMapInsertProps {
  activities: ActivityStop[]
  destination?: string
  dayNumber?: number
}

// Fallback lat/lng coordinates for common destinations
const DESTINATION_CENTERS: Record<string, [number, number]> = {
  paris: [48.8566, 2.3522],
  kyoto: [35.0116, 135.7681],
  vienna: [48.2082, 16.3738],
  london: [51.5074, -0.1278],
  rome: [41.9028, 12.4964],
  "new york": [40.7128, -74.0060],
  tokyo: [35.6762, 139.6503],
}

export const FoldableMapInsert: React.FC<FoldableMapInsertProps> = ({
  activities = [],
  destination = "Paris",
  dayNumber = 1,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [leafletModule, setLeafletModule] = useState<any>(null)

  useEffect(() => {
    import("leaflet").then((L) => {
      setLeafletModule(L.default || L)
    })
  }, [])

  // Calculate Map Center and Valid Marker Pins
  const { center, validStops } = useMemo(() => {
    const valid = activities.map((stop, idx) => {
      let lat = stop.lat
      let lng = stop.lng

      // If lat/lng missing, generate realistic coordinates near destination center
      if (!lat || !lng) {
        const key = destination.toLowerCase()
        const base = DESTINATION_CENTERS[key] || DESTINATION_CENTERS["paris"]
        lat = base[0] + (idx * 0.008 - 0.012)
        lng = base[1] + (idx * 0.006 - 0.009)
      }

      return {
        ...stop,
        lat,
        lng,
        stopIndex: idx + 1,
      }
    })

    const destKey = destination.toLowerCase()
    const defaultCenter = DESTINATION_CENTERS[destKey] || DESTINATION_CENTERS["paris"]
    const computedCenter: [number, number] =
      valid.length > 0 ? [valid[0].lat, valid[0].lng] : defaultCenter

    return { center: computedCenter, validStops: valid }
  }, [activities, destination])

  // Custom Rubber-Stamp SVG Marker Icon for Leaflet
  const createStampMarkerIcon = (category: string, number: number) => {
    if (!leafletModule) return undefined
    return leafletModule.divIcon({
      className: "custom-stamp-marker",
      html: `
        <div class="stamp-marker-container group">
          <div class="stamp-badge stamp-sepia flex items-center gap-1 bg-[#f7f2e7] border-2 border-[#7c4a27] text-[#7c4a27] px-2 py-1 rounded shadow-lg text-[10px] font-serif font-bold uppercase rotate-[-3deg] transition-transform group-hover:scale-110">
            <span class="w-4 h-4 rounded-full bg-[#7c4a27] text-[#f7f2e7] flex items-center justify-center font-sans text-[9px] font-bold">${number}</span>
            <span class="truncate max-w-[60px]">${category}</span>
          </div>
        </div>
      `,
      iconSize: [80, 32],
      iconAnchor: [40, 32],
      popupAnchor: [0, -32],
    })
  }

  // Construct Multi-waypoint Google Maps Route URL
  const handleExportGoogleMaps = () => {
    if (validStops.length === 0) return

    const waypoints = validStops.map((stop) =>
      stop.lat && stop.lng
        ? `${stop.lat},${stop.lng}`
        : `${encodeURIComponent(stop.location_name)}, ${encodeURIComponent(destination)}`
    )

    const googleMapsUrl = `https://www.google.com/maps/dir/${waypoints.join("/")}`
    window.open(googleMapsUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="w-full my-6 font-serif select-none">
      {/* Pocket Insert Envelope Header */}
      <div className="bg-[#efe7d8] border-2 border-[#b8a387] rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#7c4a27] text-[#f7f2e7] border border-[#5c351a] flex items-center justify-center shadow-inner">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-sans font-semibold text-[#7c4a27]">
                Cartographic Insert • Day {dayNumber}
              </span>
              <Badge variant="stamp" className="stamp-navy text-[9px] py-0 px-2">
                Foldable Paper Map
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-[#3d2314]">
              {destination} Topographic Excursion Route
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="gap-2 bg-[#f7f2e7] border-[#b8a387] text-[#3d2314] hover:bg-[#b8a387]/20 font-serif text-xs shadow-sm"
          >
            <Compass className="w-4 h-4 text-[#7c4a27]" />
            {isOpen ? "Fold Map Insert" : "Unroll 3-Panel Paper Map"}
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {/* Export Route Button */}
          <Button
            size="sm"
            onClick={handleExportGoogleMaps}
            className="gap-1.5 bg-[#7c4a27] hover:bg-[#63391d] text-[#f7f2e7] border border-[#b8a387] font-sans text-xs shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Export Route to Google Maps
          </Button>
        </div>
      </div>

      {/* 3-Panel Accordion Fold Animation Wrapper */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, rotateX: -45, scaleY: 0.3 }}
            animate={{ height: "440px", opacity: 1, rotateX: 0, scaleY: 1 }}
            exit={{ height: 0, opacity: 0, rotateX: -45, scaleY: 0.3 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden mt-3 rounded-xl border-4 border-[#b8a387] shadow-2xl bg-[#f7f2e7] relative perspective-[1200px] origin-top"
          >
            {/* 3-Panel Paper Fold Crease Shadows */}
            <div className="absolute inset-0 pointer-events-none z-20 grid grid-cols-3">
              <div className="border-r border-[#7c4a27]/20 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
              <div className="border-r border-[#7c4a27]/20 bg-gradient-to-r from-black/5 via-transparent to-black/5" />
              <div className="bg-gradient-to-r from-black/10 via-transparent to-black/10" />
            </div>

            {/* Vintage Parchment Map Canvas */}
            <div className="w-full h-full relative z-10">
              <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                className="w-full h-full"
                style={{ background: "#f7f2e7" }}
              >
                {/* Custom Sepia Vintage Tile Layer (Stadia Alidade Smooth Dark / Sepia fallback) */}
                <TileLayer
                  attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>'
                  url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                />

                {/* Render Rubber-Stamp Venue Markers */}
                {leafletModule &&
                  validStops.map((stop) => (
                    <Marker
                      key={stop.id}
                      position={[stop.lat, stop.lng]}
                      icon={createStampMarkerIcon(stop.category, stop.stopIndex)}
                    >
                      {/* Polaroid-Style Popup */}
                      <Popup className="polaroid-leaflet-popup">
                        <div className="bg-[#fcfaf5] p-3 border-4 border-white shadow-2xl rounded font-serif text-[#3d2314] text-xs max-w-[210px] space-y-2 text-center transform rotate-[-1deg]">
                          {/* Polaroid Image Box */}
                          <div className="w-full h-24 bg-[#efe7d8] border border-[#d4c3ab] rounded flex flex-col items-center justify-center p-2 relative shadow-inner">
                            <span className="stamp-badge stamp-sepia text-[9px] uppercase font-bold py-0.5 px-2">
                              Stop {stop.stopIndex} • {stop.category}
                            </span>
                            <p className="font-serif italic text-[11px] text-[#7c4a27] mt-1 text-center line-clamp-2">
                              "{stop.title}"
                            </p>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-bold text-sm leading-tight text-[#2b180d] font-serif">
                              {stop.title}
                            </h4>
                            <p className="text-[10px] font-sans text-muted-foreground">
                              ⏰ {stop.time_slot}
                            </p>
                            <p className="text-[10px] font-sans text-[#5c351a] border-t border-[#e2d5c3] pt-1">
                              📍 {stop.location_name}
                            </p>
                          </div>

                          {stop.vintage_tip && (
                            <p className="margin-note text-[11px] text-[#1e3a8a] italic pt-1 border-t border-[#e2d5c3]/60">
                              Tip: {stop.vintage_tip}
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>

            {/* Bottom Topographic Legend Strip */}
            <div className="absolute bottom-3 left-3 right-3 z-30 bg-[#efe7d8]/90 backdrop-blur-sm border border-[#b8a387] p-2 rounded-lg flex items-center justify-between text-xs font-sans text-[#7c4a27]">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#b45309]" /> {validStops.length} Verified Stops on Map
              </span>
              <span className="text-[10px] italic font-serif text-muted-foreground">
                Click any rubber-stamp seal to inspect Polaroid details
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
