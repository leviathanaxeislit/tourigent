import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("border-b border-border/60", className)} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { isOpen?: boolean }
>(({ className, children, isOpen, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-left w-full",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown
      className={cn(
        "h-4 w-4 shrink-0 transition-transform duration-200",
        isOpen && "rotate-180"
      )}
    />
  </button>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isOpen?: boolean }
>(({ className, children, isOpen = true, ...props }, ref) => {
  if (!isOpen) return null
  return (
    <div
      ref={ref}
      className={cn("pb-4 pt-0 text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { AccordionItem, AccordionTrigger, AccordionContent }
