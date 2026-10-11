"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const fmt = (n: number) => `${n < 0 ? "−" : "+"}${Math.abs(n).toFixed(1).padStart(5, "0")}`;

/** Ticking odometry readout in the hero frame footer. Deterministic, so server and client agree. */
export function LiveTelemetry() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 160);
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  const x = 24.6 + Math.sin(tick * 0.19) * 3.1;
  const y = -12.3 + Math.cos(tick * 0.13) * 2.4;
  const heading = (87.4 + Math.sin(tick * 0.07) * 12 + 360) % 360;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-2 border-t border-white/10 bg-ink/70 px-4 py-2.5 font-mono text-[10px] tracking-[0.14em] text-mute backdrop-blur-md sm:text-[10.5px]"
    >
      <span>
        X <span className="text-white tabular-nums">{fmt(x)}</span>
      </span>
      <span className="text-center">
        Y <span className="text-white tabular-nums">{fmt(y)}</span>
      </span>
      <span className="text-right">
        θ <span className="text-volt tabular-nums">{heading.toFixed(1).padStart(5, "0")}°</span>
      </span>
    </div>
  );
}
