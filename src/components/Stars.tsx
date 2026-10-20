"use client";

import { useId } from "react";

const starPath =
  "M12 2.5 14.9 8.4l6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5Z";
const sizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

function StarGlyph({
  fraction,
  id,
  size,
}: {
  fraction: number;
  id: string;
  size: keyof typeof sizes;
}) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={sizes[size]}>
      <defs>
        <clipPath id={id}>
          <rect width={24 * fraction} height="24" />
        </clipPath>
      </defs>
      <path d={starPath} fill="#FFF8F0" />
      <path d={starPath} fill="#FFE08A" clipPath={`url(#${id})`} />
      <path
        d={starPath}
        fill="none"
        stroke="#2B2140"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function Stars({
  rating,
  size = "md",
  onChange,
  className = "",
}: {
  rating: number;
  size?: keyof typeof sizes;
  onChange?: (rating: number) => void;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const values = [1, 2, 3, 4, 5];
  const accessibleRating = Number.isInteger(rating)
    ? rating.toString()
    : rating.toFixed(1);

  if (onChange) {
    return (
      <div
        role="radiogroup"
        aria-label="Choose a rating"
        className={`flex items-center gap-1 ${className}`}
      >
        {values.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            onClick={() => onChange(value)}
          >
            <StarGlyph
              id={`${id}-${value}`}
              fraction={Math.max(0, Math.min(1, rating - value + 1))}
              size={size}
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${accessibleRating} out of 5 stars`}
      className={`flex items-center gap-1 ${className}`}
    >
      {values.map((value) => (
        <StarGlyph
          key={value}
          id={`${id}-${value}`}
          fraction={Math.max(0, Math.min(1, rating - value + 1))}
          size={size}
        />
      ))}
    </div>
  );
}
