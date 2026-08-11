"use client"

import React from "react"
import { motion } from "framer-motion"

export interface Waypoint {
  id: string
  name: string
  elevation: string
  status: "completed" | "current" | "upcoming"
  coordinates?: string
}

interface ElevationAscentRouteProps {
  waypoints?: Waypoint[]
  currentElevationMeters?: number
  maxElevationMeters?: number
  onWaypointClick?: (waypoint: Waypoint) => void
}

const DEFAULT_WAYPOINTS: Waypoint[] = [
  { id: "wp-1", name: "Morning Start & Bakery", elevation: "Stage 1", status: "completed", coordinates: "48.8566° N, 2.3522° E" },
  { id: "wp-2", name: "Historic Cultural Stop", elevation: "Stage 2", status: "current", coordinates: "48.8570° N, 2.3530° E" },
  { id: "wp-3", name: "Scenic Panorama Pass", elevation: "Stage 3", status: "upcoming", coordinates: "48.8580° N, 2.3540° E" },
  { id: "wp-4", name: "Sunset Dining & Lounge", elevation: "Stage 4", status: "upcoming", coordinates: "48.8590° N, 2.3550° E" },
]

export const ElevationAscentRoute: React.FC<ElevationAscentRouteProps> = ({
  waypoints = DEFAULT_WAYPOINTS,
  currentElevationMeters = 2800,
  maxElevationMeters = 4810,
  onWaypointClick,
}) => {
  const percentage = Math.min(100, Math.max(0, (currentElevationMeters / maxElevationMeters) * 100))

  return (
    <div className="w-full bg-[#f5f0eb] border-2 border-[#b8860b] p-5 shadow-lg rounded-sm relative overflow-hidden deckle-edge my-6">
      {/* Brass rivet corner accents */}
      <div className="paperclip-anchor hidden sm:block" />
      <div className="absolute top-2 left-2 brass-rivet" />
      <div className="absolute top-2 right-2 brass-rivet" />

      {/* Header & Fire-Branded Leather Stamp */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-dashed border-[#b8860b]">
        <div className="flex items-center gap-3">
          <div className="pine-wax-seal text-xs font-serif font-bold">
            <span>★</span>
          </div>
          <div>
            <h3 className="font-serif text-lg tracking-wider text-[#2d3130] uppercase font-bold">
              Tourigent Itinerary Route Profile
            </h3>
            <p className="text-xs font-mono text-[#5c6260]">
              Daily Journey Progress • Curated Route Flow
            </p>
          </div>
        </div>

        <div className="leather-stamp text-xs">
          <span>TOURIGENT VERIFIED</span>
          <span className="text-[#b8860b]">★</span>
          <span>CURATED TRIP</span>
        </div>
      </div>

      {/* Elevation SVG Topo Profile Curve */}
      <div className="relative w-full h-32 my-4">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22382c" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22382c" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Topographical Grid lines */}
          <line x1="0" y1="20" x2="600" y2="20" stroke="#b8860b" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
          <line x1="0" y1="60" x2="600" y2="60" stroke="#b8860b" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
          <line x1="0" y1="100" x2="600" y2="100" stroke="#b8860b" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />

          {/* Route Profile Curve */}
          <path
            d="M 0,110 Q 150,90 200,65 T 400,35 T 600,10 L 600,120 L 0,120 Z"
            fill="url(#elevationGrad)"
          />
          <path
            d="M 0,110 Q 150,90 200,65 T 400,35 T 600,10"
            fill="none"
            stroke="#22382c"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Active Progress Traversed Ridge Path */}
          <path
            d="M 0,110 Q 150,90 200,65 T 400,35 T 600,10"
            fill="none"
            stroke="#9e472a"
            strokeWidth="3.5"
            strokeDasharray="600"
            strokeDashoffset={600 - (600 * percentage) / 100}
            strokeLinecap="round"
          />
        </svg>

        {/* Waypoint Markers */}
        <div className="absolute inset-0 flex items-end justify-between px-2 pointer-events-none">
          {waypoints.map((wp, idx) => {
            const isCompleted = wp.status === "completed"
            const isCurrent = wp.status === "current"
            return (
              <div
                key={wp.id}
                onClick={() => onWaypointClick?.(wp)}
                className="pointer-events-auto flex flex-col items-center cursor-pointer group transform hover:scale-110 transition-transform"
              >
                <div className="mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#2d3130] text-[#f5f0eb] text-[10px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap">
                  {wp.name}
                </div>

                {/* Brass Rivet Marker Node */}
                <div className="relative">
                  <div
                    className={`brass-rivet ${
                      isCurrent ? "ring-4 ring-[#9e472a] animate-pulse" : isCompleted ? "opacity-100" : "opacity-60"
                    }`}
                  />
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -inset-1 rounded-full border-2 border-[#9e472a]"
                    />
                  )}
                </div>

                <span
                  className={`mt-2 font-mono text-[11px] font-bold ${
                    isCurrent ? "text-[#9e472a]" : "text-[#2d3130]"
                  }`}
                >
                  {wp.elevation}
                </span>
                <span className="text-[10px] font-serif text-[#5c6260] hidden sm:block">{wp.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Margin Note Annotation */}
      <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#b8860b] pt-2">
        <span className="margin-note text-sm">
          ✎ "Curated route pacing optimal. All venue details and opening times live-verified."
        </span>
        <div className="text-xs font-mono text-[#22382c] font-bold flex items-center gap-1">
          <span className="brass-rivet w-2.5 h-2.5" />
          <span>STOP {waypoints.findIndex((w) => w.status === "current") + 1} OF {waypoints.length}</span>
        </div>
      </div>
    </div>
  )
}

