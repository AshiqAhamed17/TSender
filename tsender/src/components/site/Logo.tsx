// TSender mark: one point fanning out to three, the product in a glyph
export default function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="4" cy="12" r="2.6" fill="currentColor" />
      <path
        d="M6.5 12 C 12 12, 13 4.5, 19 4.5 M6.5 12 H19 M6.5 12 C 12 12, 13 19.5, 19 19.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="20" cy="4.5" r="1.8" fill="currentColor" />
      <circle cx="20" cy="12" r="1.8" fill="currentColor" />
      <circle cx="20" cy="19.5" r="1.8" fill="currentColor" />
    </svg>
  );
}
