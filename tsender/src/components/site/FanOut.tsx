// Hero artwork: one sender fanning out to many recipient wallets.
// Positions are deterministic so server and client renders match.

const W = 1000;
const H = 600;
const SOURCE = { x: 600, y: 230 };
const COUNT = 46;

function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const targets = Array.from({ length: COUNT }, (_, i) => {
  const t = i / (COUNT - 1);
  const y = 20 + t * 400 + (rand(i) - 0.5) * 6;
  const x = 930 + rand(i + 100) * 60;
  return { x, y };
});

const paths = targets.map(({ x, y }) => {
  const c1 = SOURCE.x + (x - SOURCE.x) * 0.45;
  const c2 = SOURCE.x + (x - SOURCE.x) * 0.55;
  return `M${SOURCE.x} ${SOURCE.y} C ${c1} ${SOURCE.y}, ${c2} ${y}, ${x} ${y}`;
});

// A few paths carry a travelling pulse
const pulsed = paths.filter((_, i) => i % 4 === 1);

// Incoming lines from the left: the tokens arriving at the sender
const incoming = Array.from({ length: 9 }, (_, i) => {
  const y = 60 + i * 50;
  return `M0 ${y} C 300 ${y}, 380 ${SOURCE.y}, ${SOURCE.x} ${SOURCE.y}`;
});

export default function FanOut({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fan-stroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#7aa7f7" stopOpacity="0.05" />
          <stop offset="0.4" stopColor="#7aa7f7" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7aa7f7" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id="fan-glow">
          <stop offset="0" stopColor="#3a72f6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#3a72f6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {incoming.map((d, i) => (
        <path key={`in-${i}`} d={d} stroke="#7aa7f7" strokeOpacity="0.07" strokeWidth="1" fill="none" />
      ))}

      {paths.map((d, i) => (
        <path key={i} d={d} stroke="url(#fan-stroke)" strokeWidth="0.8" fill="none" />
      ))}

      {pulsed.map((d, i) => (
        <path
          key={`p-${i}`}
          d={d}
          pathLength={1}
          stroke="#cfe0ff"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="0.05 1"
          style={{
            animation: `fan-pulse 3.6s ${(i * 0.37) % 3.6}s linear infinite`,
          }}
        />
      ))}

      <circle cx={SOURCE.x} cy={SOURCE.y} r="70" fill="url(#fan-glow)" />
      <circle cx={SOURCE.x} cy={SOURCE.y} r="5" fill="#eaf1ff" />

      {targets.map(({ x, y }, i) => (
        <circle key={`t-${i}`} cx={x} cy={y} r="2.2" fill="#9cc0ff" fillOpacity="0.85" />
      ))}

      <style>{`
        @keyframes fan-pulse {
          from { stroke-dashoffset: 0.05; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          to { stroke-dashoffset: -1; opacity: 0; }
        }
      `}</style>
    </svg>
  );
}
