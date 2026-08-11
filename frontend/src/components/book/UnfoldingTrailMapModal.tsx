"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface UnfoldingTrailMapModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
}

export const UnfoldingTrailMapModal: React.FC<UnfoldingTrailMapModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          {/* Unfolding Canvas Map Container */}
          <motion.div
            initial={{ scaleX: 0.2, opacity: 0, rotateY: -30 }}
            animate={{ scaleX: 1, opacity: 1, rotateY: 0 }}
            exit={{ scaleX: 0.1, opacity: 0, rotateY: 30 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#f5f0eb] border-4 border-[#b8860b] shadow-2xl overflow-hidden flex flex-col deckle-edge bg-topo-pattern"
          >
            {/* Brass Corner Rivets */}
            <div className="absolute top-3 left-3 brass-rivet z-30" />
            <div className="absolute top-3 right-3 brass-rivet z-30" />
            <div className="absolute bottom-3 left-3 brass-rivet z-30" />
            <div className="absolute bottom-3 right-3 brass-rivet z-30" />

            {/* Accordion Map Top Header Banner */}
            <div className="relative z-20 bg-[#22382c] text-[#f5f0eb] p-5 border-b-2 border-[#b8860b] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="pine-wax-seal text-sm">
                  <span>🗺️</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="leather-stamp text-[10px]">TOURIGENT MAP FOLD</span>
                    <span className="text-xs font-mono text-[#b8860b]">CURATED CANVAS</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#f5f0eb]">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs font-mono text-[#e3ded6] mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>

              {/* Close Canvas Flap Button */}
              <button
                onClick={onClose}
                className="group flex items-center gap-2 bg-[#9e472a] hover:bg-[#b8860b] text-[#f5f0eb] px-4 py-2 rounded-sm border border-[#b8860b] transition-colors shadow-md text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
              >
                <span>Fold Canvas</span>
                <span className="brass-rivet w-2.5 h-2.5 group-hover:scale-125 transition-transform" />
              </button>
            </div>

            {/* Unfolding 3-Panel Accordion Layout inside Modal */}
            <div className="relative z-10 flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Panel: Cartography Field Stamp */}
              <div className="md:col-span-4 bg-[#e3ded6]/60 border border-[#b8860b] p-4 rounded-sm shadow-inner flex flex-col justify-between">
                <div>
                  <div className="leather-stamp-terracotta text-xs mb-3">
                    <span>TOURIGENT LEDGER</span>
                  </div>
                  <p className="font-mono text-xs text-[#2d3130] leading-relaxed">
                    This canvas trail map section unfolds verified venue details, real-time ticket pricing, and curated route coordinates retrieved directly for your Tourigent trip.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-dashed border-[#b8860b]">
                  <span className="margin-note text-sm">
                    ✎ "Always verify local market hours & sunset viewpoints."
                  </span>
                </div>
              </div>

              {/* Right Panel: Content Area */}
              <div className="md:col-span-8 bg-[#f5f0eb] border border-[#b8860b] p-5 shadow-md">
                {children}
              </div>
            </div>

            {/* Bottom Ledger Footer Bar */}
            <div className="relative z-20 bg-[#2d3130] text-[#f5f0eb] px-6 py-3 border-t-2 border-[#b8860b] flex flex-wrap items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-[#b8860b]">
                <span className="brass-rivet w-3 h-3" />
                <span>TOURIGENT CURATED CARTOGRAPHY • REAL-TIME VERIFIED</span>
              </div>
              <span className="text-[#e3ded6] opacity-80">Click anywhere outside or button to fold back into ledger</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
