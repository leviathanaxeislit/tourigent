"use client"

import React, { useState } from "react"
import { RefreshCw, Pin, Sparkles, X, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SwapStopModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string) => Promise<void>
  currentStopTitle?: string
  dayNumber?: number
}

export const SwapStopModal: React.FC<SwapStopModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentStopTitle = "this venue",
  dayNumber = 1,
}) => {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const presets = [
    "Want vegetarian / vegan dining options",
    "Indoor alternative for rainy weather",
    "Lower budget / free landmark",
    "Historic speakeasy or secret tearoom",
    "Family-friendly & low walking distance",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(reason)
      setReason("")
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectPreset = (preset: string) => {
    setReason(preset)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="bg-[#fffbeb] border-2 border-[#d97706] shadow-2xl p-6 font-serif max-w-md rounded-xl relative overflow-hidden select-none">
        {/* Sticky Note Pin / Tape Aesthetics */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-20 h-4 bg-[#fef08a]/80 border-b border-[#ca8a04]/40 rotate-[-1deg] shadow-sm" />
          <Pin className="w-5 h-5 text-[#b45309] absolute -top-1 fill-current" />
        </div>

        <DialogHeader className="pt-4 text-center space-y-2">
          <Badge variant="stamp" className="stamp-crimson text-[10px] mx-auto rotate-[-2deg]">
            Day {dayNumber} Activity Revision
          </Badge>
          <DialogTitle className="text-xl font-bold font-serif text-[#78350f]">
            Swap Venue: "{currentStopTitle}"
          </DialogTitle>
          <DialogDescription className="font-sans text-xs text-[#92400e]">
            Why replace this venue? Write a note to tailor your replacement stop.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 font-sans">
          {/* Quick Preset Choice Badges */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#78350f] uppercase tracking-wider block">
              Quick Reasons:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-[#fef3c7] hover:bg-[#fde68a] text-[#92400e] border border-[#f59e0b]/40 transition-colors text-left font-serif italic"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Handwritten Sticky Note Input Area */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-[#78350f] block">
              Custom Preference / Reason:
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Want vegetarian options, indoor alternative, lower budget..."
              className="bg-[#fefce8] border-[#f59e0b] text-[#78350f] placeholder:text-[#d97706]/60 font-serif italic text-sm focus-visible:ring-[#b45309] min-h-[90px] shadow-inner"
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="pt-2 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs text-[#92400e] hover:bg-[#fef3c7]"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-[#b45309] hover:bg-[#92400e] text-[#fefce8] border border-[#78350f] font-serif text-xs px-4 h-9 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Swapping Venue...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Replacement
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
