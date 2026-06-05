import { useEffect, useRef, useState } from "react";

export const IMPACT_STATS = [
  { tag: "01/ Rescue", value: 550, suffix: "+", label: "Animals Rescued" },
  { tag: "02/ Care", value: 545, suffix: "+", label: "Sterilizations" },
  { tag: "03/ Family", value: 223, suffix: "+", label: "Adoptions" },
  { tag: "04/ Reach", value: 12, suffix: "+", label: "Cities in India" },
];

function CountUp({
  to,
  suffix = "",
  duration = 2000,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setN(Math.round(to * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

export function ImpactStats() {
  return (
    <section className="py-24 border-y border-border bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {IMPACT_STATS.map((s) => (
            <div key={s.tag} className="space-y-2">
              <span className="font-mono text-primary text-sm">{s.tag}</span>
              <div className="text-5xl font-bold tracking-tighter tabular-nums">
                <CountUp to={s.value} suffix={s.suffix} />
              </div>
              <p className="text-sm text-background/60 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
