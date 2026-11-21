interface LogoProps {
  size?: number
  className?: string
}

/** Minimal geometric Cadence pulse mark. Inherits its color via currentColor. */
export function Logo({ size = 22, className }: LogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 24h8l4-10 7 20 4-10h9"
        stroke="currentColor"
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
