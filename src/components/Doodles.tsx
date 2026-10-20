import type { CSSProperties } from "react";

type DoodleProps = { className?: string };

export function Mascot({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <path
        d="M37 39c0-17 9-27 23-27s23 10 23 27"
        stroke="#2B2140"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M26 43c0-5 4-9 9-9h48c5 0 9 4 9 9v49c0 7-5 12-12 12H38c-7 0-12-5-12-12V43Z"
        fill="#FFB4A2"
        stroke="#2B2140"
        strokeWidth="2.5"
      />
      <circle cx="46" cy="63" r="3" fill="#2B2140" />
      <circle cx="74" cy="63" r="3" fill="#2B2140" />
      <path d="M48 75c7 8 17 8 24 0" stroke="#2B2140" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="37" cy="72" r="5" fill="#FF8C69" opacity=".7" />
      <circle cx="83" cy="72" r="5" fill="#FF8C69" opacity=".7" />
    </svg>
  );
}

export function Truck({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 170 100" fill="none" className={className} aria-hidden="true">
      <path d="M4 35h10M10 47h13M0 59h10" stroke="#2B2140" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 27h78v43H22z" fill="#B8E6C9" stroke="#2B2140" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 40h26l20 22v8h-46V40Z" fill="#FFE08A" stroke="#2B2140" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M110 45v16h26l-14-16h-12Z" fill="#A8D8FF" stroke="#2B2140" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="52" cy="73" r="10" fill="#FFF8F0" stroke="#2B2140" strokeWidth="2.5" />
      <circle cx="52" cy="73" r="3" fill="#2B2140" />
      <circle cx="124" cy="73" r="10" fill="#FFF8F0" stroke="#2B2140" strokeWidth="2.5" />
      <circle cx="124" cy="73" r="3" fill="#2B2140" />
    </svg>
  );
}

export function Cloud({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 72" fill="none" className={className} aria-hidden="true">
      <path
        d="M28 56h63a17 17 0 0 0 0-34 25 25 0 0 0-47-7 21 21 0 0 0-16 41Z"
        fill="#A8D8FF"
        stroke="#2B2140"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Star({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 72 72" fill="none" className={className} aria-hidden="true">
      <path
        d="m36 5 8 20 21 1-16 14 5 21-18-12-18 12 5-21L7 26l21-1 8-20Z"
        fill="#FFE08A"
        stroke="#2B2140"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Heart({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 72 72" fill="none" className={className} aria-hidden="true">
      <path
        d="M36 61 11 37C-1 22 19 6 36 23 53 6 73 22 61 37L36 61Z"
        fill="#FFC8DD"
        stroke="#2B2140"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Squiggle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 160 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 15c13-18 21 18 34 0s21 18 34 0 21 18 34 0 21 18 34 0 15-1 18 0"
        stroke="#FF8C69"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sparkle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M32 4c2 17 7 22 24 24-17 2-22 7-24 24C30 35 25 30 8 28 25 26 30 21 32 4Z"
        fill="#FFE08A"
        stroke="#2B2140"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wave({ className }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 45c160 70 320-50 480 0s320 50 480 0 320-55 480 0v75H0V45Z"
        fill="#B8E6C9"
      />
    </svg>
  );
}

export function BackgroundDoodles() {
  const delays: CSSProperties[] = [
    { animationDelay: "0s" },
    { animationDelay: "1.2s" },
    { animationDelay: "2.1s" },
    { animationDelay: "0.7s" },
    { animationDelay: "1.8s" },
    { animationDelay: "2.8s" },
    { animationDelay: "0.4s" },
    { animationDelay: "2.4s" },
  ];

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden md:block"
      aria-hidden="true"
    >
      <div className="absolute -left-16 top-[18%]" style={delays[0]}><Cloud className="animate-float w-20 opacity-30" /></div>
      <div className="absolute right-[7%] top-[16%]" style={delays[1]}><Star className="animate-float w-11 opacity-35" /></div>
      <div className="absolute left-[5%] top-[55%]" style={delays[2]}><Heart className="animate-float w-10 opacity-30" /></div>
      <div className="absolute right-[4%] top-[43%]" style={delays[3]}><Sparkle className="animate-float w-12 opacity-35" /></div>
      <div className="absolute bottom-[14%] left-[8%]" style={delays[4]}><Star className="animate-float w-9 opacity-30" /></div>
      <div className="absolute bottom-[17%] right-[5%]" style={delays[5]}><Cloud className="animate-float w-24 opacity-25" /></div>
      <div className="absolute right-[16%] top-[72%]" style={delays[6]}><Heart className="animate-float w-8 opacity-30" /></div>
      <div className="absolute left-[17%] top-[32%]" style={delays[7]}><Sparkle className="animate-float w-8 opacity-25" /></div>
    </div>
  );
}
