"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createProjector,
  deg,
  groundCircle,
  groundGrid,
  renderShaded,
  type DrawItem,
  type LocalShape,
  type Projector,
} from "@/lib/robot/engine";
import { robotCenter, robotParts } from "@/lib/robot/model";

const VIEW = 600;
const BASE_YAW = deg(34);
const BASE_PITCH = deg(18);
const DRIVE_SPEED = 14; // in/s — ground "treadmill" speed
const WHEEL_RADIUS = 2.05;

type Vec = [number, number, number];
type Spark = { p: Vec; v: Vec; life: number; ttl: number };
type Sim = { t: number; yaw: number; pitch: number; spin: number; travel: number; sparks: Spark[] };

const INITIAL: Sim = { t: 0, yaw: BASE_YAW, pitch: BASE_PITCH, spin: 0, travel: 0, sparks: [] };

// Deterministic jitter so every frame of the effect is reproducible.
function noise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function stepSparks(sim: Sim, dt: number) {
  const sparks = sim.sparks;
  for (const s of sparks) {
    s.life -= dt;
    s.v[1] -= 160 * dt;
    s.p[0] += s.v[0] * dt;
    s.p[1] += s.v[1] * dt;
    s.p[2] += s.v[2] * dt;
  }
  sim.sparks = sparks.filter((s) => s.life > 0 && s.p[1] > -0.2);
  // Emit from the rear wheels' contact patches.
  const emit = Math.floor(sim.t * 70) - Math.floor((sim.t - dt) * 70);
  for (let i = 0; i < emit; i++) {
    const seed = sim.t * 1000 + i;
    // Bias toward the right-rear wheel, which faces the camera.
    const side = noise(seed) > 0.3 ? 1 : -1;
    const ttl = 0.22 + noise(seed + 1) * 0.35;
    sim.sparks.push({
      p: [side * (7.4 + noise(seed + 2) * 1.2), 0.1, -6.6 - noise(seed + 3) * 0.6],
      v: [side * (8 + noise(seed + 4) * 18), 8 + noise(seed + 5) * 26, -(22 + noise(seed + 6) * 34)],
      life: ttl,
      ttl,
    });
  }
}

function LocalShapes({ shapes }: { shapes: LocalShape[] }) {
  return shapes.map((s, i) => {
    if (s.t === "circle")
      return (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill={s.fill ?? "none"}
          stroke={s.stroke}
          strokeWidth={s.sw}
          opacity={s.opacity}
        />
      );
    if (s.t === "path") return <path key={i} d={s.d} fill={s.fill} />;
    return (
      <text
        key={i}
        x={0}
        y={0}
        dy="0.36em"
        textAnchor="middle"
        fontSize={s.size}
        fontWeight={s.weight}
        letterSpacing={s.tracking}
        fill={s.fill}
        style={{
          fontFamily: s.family === "mono" ? "var(--font-jetbrains)" : "var(--font-saira)",
          fontStretch: s.family === "display" ? "62.5%" : undefined,
        }}
      >
        {s.text}
      </text>
    );
  });
}

function DrawItems({ items }: { items: DrawItem[] }) {
  return items.map((it) => {
    if (it.t === "poly")
      return <path key={it.key} d={it.d} fill={it.fill} stroke={it.stroke} strokeWidth={0.8} strokeLinejoin="round" />;
    if (it.t === "stroke")
      return (
        <path
          key={it.key}
          d={it.d}
          fill="none"
          stroke={it.stroke}
          strokeWidth={it.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    return (
      <g key={it.key} transform={it.transform}>
        <LocalShapes shapes={it.shapes} />
      </g>
    );
  });
}

function sparkSegments(sparks: Spark[], proj: Projector) {
  return sparks.map((s, i) => {
    const [x0, y0] = proj.point(s.p);
    const [x1, y1] = proj.point([s.p[0] - s.v[0] * 0.035, s.p[1] - s.v[1] * 0.035, s.p[2] - s.v[2] * 0.035]);
    const a = s.life / s.ttl;
    const d = `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`;
    return (
      <g key={i} strokeLinecap="round">
        <path d={d} stroke="#ffaa00" strokeOpacity={0.35 * a} strokeWidth={5} />
        <path
          d={d}
          stroke={a > 0.5 ? "#fffbe0" : "#ffd000"}
          strokeOpacity={Math.min(1, a * 1.5)}
          strokeWidth={a > 0.5 ? 2 : 1.4}
        />
      </g>
    );
  });
}

/**
 * Live, shaded 3D render of the robot for the hero showcase. It sways on a
 * turntable, follows the mouse, spins its mecanum wheels over a moving floor grid
 * and throws sparks. Animation pauses off-screen and for reduced-motion users.
 */
export function RobotRender({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { margin: "160px" });
  const reduce = useReducedMotion();
  const sim = useRef<Sim>({ ...INITIAL, sparks: [] });
  const pointer = useRef({ x: 0, y: 0 });
  const [frame, setFrame] = useState<Sim>(INITIAL);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce]);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      s.t += dt;
      const yawTarget = BASE_YAW + deg(15) * Math.sin(s.t * 0.33) + deg(10) * pointer.current.x;
      const pitchTarget = BASE_PITCH + deg(3) * Math.sin(s.t * 0.21) - deg(5) * pointer.current.y;
      const ease = 1 - Math.exp(-dt * 2.4);
      s.yaw += (yawTarget - s.yaw) * ease;
      s.pitch += (pitchTarget - s.pitch) * ease;
      s.travel += DRIVE_SPEED * dt;
      s.spin -= (DRIVE_SPEED / WHEEL_RADIUS) * dt;
      stepSparks(s, dt);
      setFrame({ ...s, sparks: s.sparks.map((k) => ({ ...k, p: [...k.p] as Vec, v: [...k.v] as Vec })) });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  const scene = useMemo(() => {
    const proj = createProjector(
      { yaw: frame.yaw, pitch: frame.pitch },
      { cx: VIEW / 2, cy: VIEW * 0.47, scale: 17.5, target: robotCenter },
    );
    const ticks = Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2 + frame.t * 0.15;
      const r0 = i % 4 === 0 ? 12.4 : 12.75;
      const [x0, y0] = proj.point([Math.cos(a) * r0, 0, Math.sin(a) * r0]);
      const [x1, y1] = proj.point([Math.cos(a) * 13.2, 0, Math.sin(a) * 13.2]);
      return `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }).join("");
    return {
      proj,
      ground: proj.matrix([0, 0, 0], [1, 0, 0], [0, 0, 1]),
      grid: groundGrid(14, 2.4, -frame.travel, proj),
      ringInner: groundCircle(11.2, proj),
      ringOuter: groundCircle(13.2, proj),
      ticks,
      items: renderShaded(robotParts, proj, frame.spin),
    };
  }, [frame]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className={className}
      role="img"
      aria-label="3D render of the SPIRIT competition robot: mecanum drivetrain, three-stage linear slides and a compliant claw inside an 18-inch frame."
    >
      <defs>
        <radialGradient id="rr-pad">
          <stop offset="0" stopColor="#ffe600" stopOpacity="0.28" />
          <stop offset="0.6" stopColor="#ffaa00" stopOpacity="0.07" />
          <stop offset="1" stopColor="#ffaa00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rr-shadow">
          <stop offset="0.35" stopColor="#000" stopOpacity="0.9" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={scene.ground}>
        <circle r={14.5} fill="url(#rr-pad)" />
        <circle r={12.5} fill="url(#rr-shadow)" />
      </g>
      {scene.grid.map((line, i) => (
        <path key={i} d={line.d} stroke="#ffe600" strokeOpacity={0.2 * line.opacity} strokeWidth={1} />
      ))}
      <path d={scene.ringOuter} fill="none" stroke="#ffffff" strokeOpacity={0.14} />
      <path
        d={scene.ringInner}
        fill="none"
        stroke="#ffe600"
        strokeOpacity={0.55}
        strokeWidth={1.4}
        strokeDasharray="3 9"
        strokeDashoffset={-frame.t * 14}
      />
      <path d={scene.ticks} stroke="#ffe600" strokeOpacity={0.35} />

      {sparkSegments(frame.sparks, scene.proj)}
      <DrawItems items={scene.items} />
    </svg>
  );
}
