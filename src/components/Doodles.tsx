import type { CSSProperties } from "react";

type DoodleProps = { className?: string };

export function Mascot({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <path d="M34 34c1-14 7-22 16-22s15 8 16 22" stroke="#3B3226" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M24 31h52l-4 57c-.4 5-4 8-9 8H37c-5 0-8.6-3-9-8l-4-57Z"
        fill="#F9A8A8"
        stroke="#3B3226"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M38 60v1M62 60v1" stroke="#3B3226" strokeWidth="4" strokeLinecap="round" />
      <path d="M42 70c4 5 12 5 16 0" stroke="#3B3226" strokeWidth="3" strokeLinecap="round" />
      <path d="M33 68h.5M66.5 68h.5" stroke="#E4572E" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function Truck({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 170 100" fill="none" className={className} aria-hidden="true">
      <path d="M4 35h10M10 47h13M0 59h10" stroke="#3B3226" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 27h78v43H22z" fill="#FFFDF7" stroke="#3B3226" strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 40h26l20 22v8h-46V40Z" fill="#F9A8A8" stroke="#3B3226" strokeWidth="3" strokeLinejoin="round" />
      <path d="M110 45v16h26l-14-16h-12Z" fill="#E8F4FB" stroke="#3B3226" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="52" cy="73" r="10" fill="#FFFDF7" stroke="#3B3226" strokeWidth="3" />
      <circle cx="124" cy="73" r="10" fill="#FFFDF7" stroke="#3B3226" strokeWidth="3" />
    </svg>
  );
}

export function Cloud({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 72" fill="none" className={className} aria-hidden="true">
      <path
        d="M28 56h63a17 17 0 0 0 0-34 25 25 0 0 0-47-7 21 21 0 0 0-16 41Z"
        fill="#FFFDF7"
        stroke="#3B3226"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Star({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 72 72" fill="none" className={className} aria-hidden="true">
      <path
        d="m36 5 8 20 21 1-16 14 5 21-18-12-18 12 5-21L7 26l21-1 8-20Z"
        fill="#FDF0C6"
        stroke="#3B3226"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Heart({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 72 72" fill="none" className={className} aria-hidden="true">
      <path
        d="M36 61 11 37C-1 22 19 6 36 23 53 6 73 22 61 37L36 61Z"
        fill="#FDE2E2"
        stroke="#3B3226"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Squiggle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 160 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 15c13-18 21 18 34 0s21 18 34 0 21 18 34 0 21 18 34 0 15-1 18 0"
        stroke="#E4572E"
        strokeWidth="3"
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
        fill="#FDF0C6"
        stroke="#3B3226"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StoryScene({ className }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 400 280"
      fill="none"
      className={className}
      stroke="#3B3226"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="330" cy="60" r="32" fill="#F7C948" />
      <path d="M330 12v-8M368 26l6-6M378 60h8M292 26l-6-6" />
      <path d="M40 230q160-14 330 0" />
      <path d="M60 225v-80h150v80" fill="#FFFDF7" />
      <path d="M210 165h55l30 35v25h-85z" fill="#F9A8A8" />
      <path d="M225 175h30l18 22h-48z" fill="#E8F4FB" />
      <circle cx="100" cy="232" r="18" fill="#FFFDF7" />
      <circle cx="250" cy="232" r="18" fill="#FFFDF7" />
      <path d="M90 170h60M90 195h40" />
      <path d="M10 160h30M0 185h28M14 210h22" strokeDasharray="6 6" />
      <path
        d="M120 60q20-30 40 0 25-5 25 20 0 22-25 20h-55q-25 0-22-20 4-22 37-20z"
        fill="#FFFDF7"
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
      <path d="M0 45c160 70 320-50 480 0s320 50 480 0 320-55 480 0v75H0V45Z" fill="#FDF0C6" />
      <path d="M0 45c160 70 320-50 480 0s320 50 480 0 320-55 480 0" stroke="#3B3226" strokeWidth="3" />
    </svg>
  );
}

function Spiral({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
      <path
        d="M42 12c-18-2-31 11-29 29 2 17 19 27 34 19 12-7 13-24 2-31-9-6-21 0-20 10 1 7 8 10 13 6"
        stroke="#3B3226"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PaperPlane({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 80 70" fill="none" className={className} aria-hidden="true">
      <path
        d="m8 30 63-23-21 55-13-21L8 30Z"
        fill="#E8F4FB"
        stroke="#3B3226"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="m37 41 34-34M37 41l-3 20" stroke="#3B3226" strokeWidth="3" strokeLinecap="round" />
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
      <div className="absolute top-[18%]" style={{ ...delays[0], left: "max(-40px, calc(50% - 760px))" }}>
        <Cloud className="animate-float w-16 opacity-25" />
      </div>
      <div className="absolute top-[20%]" style={{ ...delays[1], right: "max(-40px, calc(50% - 760px))" }}>
        <Star className="animate-float w-9 opacity-25" />
      </div>
      <div className="absolute top-[46%]" style={{ ...delays[2], left: "max(-40px, calc(50% - 760px))" }}>
        <PaperPlane className="animate-float w-12 opacity-25" />
      </div>
      <div className="absolute top-[54%]" style={{ ...delays[3], right: "max(-40px, calc(50% - 760px))" }}>
        <Spiral className="animate-float w-12 opacity-25" />
      </div>
      <div className="absolute bottom-[14%]" style={{ ...delays[4], left: "max(-40px, calc(50% - 760px))" }}>
        <Star className="animate-float w-8 opacity-25" />
      </div>
      <div className="absolute bottom-[17%]" style={{ ...delays[5], right: "max(-40px, calc(50% - 760px))" }}>
        <Cloud className="animate-float w-20 opacity-20" />
      </div>
      <div className="absolute top-[76%]" style={{ ...delays[6], right: "max(-40px, calc(50% - 760px))" }}>
        <PaperPlane className="animate-float w-9 opacity-25" />
      </div>
      <div className="absolute top-[80%]" style={{ ...delays[7], left: "max(-40px, calc(50% - 760px))" }}>
        <Spiral className="animate-float w-9 opacity-20" />
      </div>
    </div>
  );
}
