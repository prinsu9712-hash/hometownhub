import { SparkIcon } from "./Icons";

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  left: `${10 + i * 8}%`,
  delay: `${i * 0.4}s`,
  duration: `${3 + (i % 3)}s`,
  size: `${4 + (i % 3)}px`
}));

function HeroBanner({ tag, title, sub, chips = [] }) {
  return (
    <div className="hero-gradient mb-8 p-7 sm:p-9">
      {PARTICLES.map((item, idx) => (
        <span
          key={`${item.left}-${idx}`}
          className="particle"
          style={{
            left: item.left,
            bottom: "10%",
            width: item.size,
            height: item.size,
            animationDuration: item.duration,
            animationDelay: item.delay
          }}
        />
      ))}

      <div className="hero-content relative z-[1]">
        <span className="hero-chip mb-3 inline-flex">
          <SparkIcon className="h-3.5 w-3.5" />
          {tag}
        </span>
        <h1
          className="text-3xl font-black leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.2)] sm:text-5xl"
          style={{ fontFamily: '"Playfair Display", "Outfit", serif' }}
        >
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85 sm:text-base">
          {sub}
        </p>
        {chips.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span key={chip} className="hero-chip">
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute -right-5 -top-5 h-48 w-48 rounded-full border border-white/10 bg-white/5" />
      <div className="pointer-events-none absolute bottom-[-2.6rem] right-9 h-32 w-32 rounded-full border border-white/10 bg-white/5" />
    </div>
  );
}

export default HeroBanner;
