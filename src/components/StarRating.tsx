import { Star } from '@phosphor-icons/react'
import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
  size?: number
}

export function StarRating({ value, onChange, disabled = false, size = 24 }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value)
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => !disabled && setHover(0)}
            onClick={() => !disabled && onChange(star)}
            className="transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            style={{ minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Star
              size={size}
              weight={filled ? 'fill' : 'regular'}
              className={filled ? 'text-amber-500' : 'text-gray-300'}
            />
          </button>
        )
      })}
    </div>
  )
}
