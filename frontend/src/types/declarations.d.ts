declare module "react-pageflip" {
  import * as React from "react"

  export interface FlipBookProps {
    width?: number
    height?: number
    size?: "fixed" | "stretch"
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    drawShadow?: boolean
    flippingTime?: number
    usePortrait?: boolean
    startZIndex?: number
    autoSize?: boolean
    maxShadowOpacity?: number
    showCover?: boolean
    mobileScrollSupport?: boolean
    clickEventForward?: boolean
    useMouseEvents?: boolean
    swipeDistance?: number
    showPageCorners?: boolean
    disableFlipByClick?: boolean
    className?: string
    style?: React.CSSProperties
    ref?: any
    onFlip?: (e: { data: number }) => void
    children?: React.ReactNode
  }

  const HTML5FlipBook: React.ForwardRefExoticComponent<
    FlipBookProps & React.RefAttributes<any>
  >
  export default HTML5FlipBook
}

declare module "lucide-react"
