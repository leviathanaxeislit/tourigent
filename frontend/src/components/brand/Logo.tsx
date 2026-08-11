import React from "react"

interface LogoProps {
  className?: string
  size?: number
  showText?: boolean
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = 40,
  showText = true,
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        {/* Outer Parchment/Brass Octagon Ring */}
        <path
          d="M30 5 L70 5 L95 30 L95 70 L70 95 L30 95 L5 70 L5 30 Z"
          fill="#f5f0eb"
          stroke="#b8860b"
          strokeWidth="3"
        />

        {/* Inner Pine Wax Seal Circle */}
        <circle cx="50" cy="50" r="38" fill="#22382c" stroke="#b8860b" strokeWidth="2" />
        <circle cx="50" cy="50" r="34" stroke="#b8860b" strokeWidth="1" strokeDasharray="3 3" />

        {/* Vintage Brass Compass Rose */}
        {/* North Point */}
        <polygon points="50,18 55,48 50,45" fill="#b8860b" />
        <polygon points="50,18 45,48 50,45" fill="#9e472a" />

        {/* South Point */}
        <polygon points="50,82 55,52 50,55" fill="#b8860b" />
        <polygon points="50,82 45,52 50,55" fill="#9e472a" />

        {/* East Point */}
        <polygon points="82,50 52,55 55,50" fill="#b8860b" />
        <polygon points="82,50 52,45 55,50" fill="#9e472a" />

        {/* West Point */}
        <polygon points="18,50 48,55 45,50" fill="#b8860b" />
        <polygon points="18,50 48,45 45,50" fill="#9e472a" />

        {/* Center Brass Rivet */}
        <circle cx="50" cy="50" r="6" fill="#b8860b" stroke="#f5f0eb" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="2" fill="#22382c" />

        {/* Decorative Stamps */}
        <text x="50" y="32" fontSize="6" fill="#f5f0eb" textAnchor="middle" fontWeight="bold" fontFamily="serif">N</text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-serif font-bold text-xl tracking-wider text-[#2d3130] uppercase leading-none">
            Tourigent
          </span>
          <span className="font-mono text-[9px] tracking-widest text-[#9e472a] uppercase font-semibold">
            Vintage Travel Ledger
          </span>
        </div>
      )}
    </div>
  )
}
