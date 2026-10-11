"use client";

import { animate, m, useInView, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { Rotate3d } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { HudCorners } from "@/components/ui/primitives";
import {
  createProjector,
  deg,
  groundGrid,
  renderWireframe,
  wireBounds,
  type Projector,
  type View,
} from "@/lib/robot/engine";
import { callouts, robotCenter, robotParts, sizingEnvelope, type Subsystem, type Vec3 } from "@/lib/robot/model";
import { cn } from "@/lib/utils";

const W = 640;
const H = 560;
const PITCH_MIN = deg(-8);
const PITCH_MAX = deg(89);
const SYSTEMS: Subsystem[] = ["frame", "drivetrain", "vision", "scoring"];

const PRESETS = {
  iso: { label: "ISO", view: { yaw: deg(38), pitch: deg(24) } },
  front: { label: "FRONT", view: { yaw: 0, pitch: deg(3) } },
  side: { label: "SIDE", view: { yaw: deg(90), pitch: deg(3) } },
  top: { label: "TOP", view: { yaw: 0, pitch: deg(89) } },
} satisfies Record<string, { label: string; view: View }>;

type PresetId = keyof typeof PRESETS;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const wrapDeg = (rad: number) => ((((rad * 180) / Math.PI) % 360) + 360) % 360;
const MONO = { fontFamily: "var(--font-jetbrains), ui-monospace, monospace" };

type PlacedCallout = {
  id: string;
  label: string;
  sub: string;
  ax: number;
  ay: number;
  side: "left" | "right";
  ly: number;
  width: number;
};

function layoutCallouts(items: (typeof callouts)[Subsystem], proj: Projector): PlacedCallout[] {
  const placed = items.map((c) => {
    const [ax, ay] = proj.point(c.at);
    return {
      id: c.id,
      label: c.label,
      sub: c.sub,
      ax,
      ay,
      side: (ax >= W / 2 ? "right" : "left") as PlacedCallout["side"],
      ly: ay - 30,
      width: Math.max(c.label.length * 7.6, c.sub.length * 6.1) + 22,
    };
  });
  for (const side of ["left", "right"] as const) {
    const list = placed.filter((p) => p.side === side).sort((a, b) => a.ly - b.ly);
    list.forEach((p, i) => {
      p.ly = clamp(p.ly, 70, H - 70);
      if (i > 0) p.ly = Math.max(p.ly, list[i - 1].ly + 52);
    });
  }
  return placed;
}

function Callout({ c, reduce }: { c: PlacedCallout; reduce: boolean | null }) {
  const boxX = c.side === "left" ? 14 : W - 14 - c.width;
  const edgeX = c.side === "left" ? boxX + c.width : boxX;
  const elbowX =
    c.side === "left"
      ? Math.max(edgeX + 18, Math.min(c.ax - 18, edgeX + 60))
      : Math.min(edgeX - 18, Math.max(c.ax + 18, edgeX - 60));
  const textX = c.side === "left" ? boxX + 11 : boxX + c.width - 11;
  const anchor = c.side === "left" ? "start" : "end";
  return (
    <g>
      <path
        d={`M${c.ax.toFixed(1)} ${c.ay.toFixed(1)}L${elbowX.toFixed(1)} ${(c.ly + 4).toFixed(1)}L${edgeX.toFixed(1)} ${(c.ly + 4).toFixed(1)}`}
        fill="none"
        stroke="#ffe600"
        strokeOpacity={0.75}
        strokeWidth={1}
      />
      <circle cx={c.ax} cy={c.ay} r={3.2} fill="#ffe600" />
      <circle cx={c.ax} cy={c.ay} r={7} fill="none" stroke="#ffe600" strokeOpacity={0.5}>
        {!reduce && (
          <>
            <animate attributeName="r" values="4;11;4" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.7;0;0.7" dur="2.4s" repeatCount="indefinite" />
          </>
        )}
      </circle>
      <rect
        x={boxX}
        y={c.ly - 14}
        width={c.width}
        height={38}
        fill="#0a0a0a"
        fillOpacity={0.88}
        stroke="#ffe600"
        strokeOpacity={0.45}
      />
      <rect x={c.side === "left" ? boxX : boxX + c.width - 3} y={c.ly - 14} width={3} height={38} fill="#ffe600" />
      <text
        x={textX}
        y={c.ly + 2}
        textAnchor={anchor}
        fontSize={11.5}
        fontWeight={700}
        letterSpacing={1}
        fill="#ffffff"
        style={MONO}
      >
        {c.label}
      </text>
      <text x={textX} y={c.ly + 16} textAnchor={anchor} fontSize={9} letterSpacing={1} fill="#9ca3af" style={MONO}>
        {c.sub}
      </text>
    </g>
  );
}

/** Phone-size callout: a numbered marker that pairs with the legend under the viewer. */
function Marker({ c, n }: { c: PlacedCallout; n: number }) {
  return (
    <g>
      <circle cx={c.ax} cy={c.ay} r={17} fill="#ffe600" stroke="#0a0a0a" strokeWidth={4} />
      <text x={c.ax} y={c.ay + 7} textAnchor="middle" fontSize={20} fontWeight={800} fill="#0a0a0a" style={MONO}>
        {n}
      </text>
    </g>
  );
}

function SizingEnvelope({ proj }: { proj: Projector }) {
  const { min, max } = sizingEnvelope;
  const dims: { from: Vec3; to: Vec3; offset: [number, number] }[] = [
    { from: [min[0], 0, max[2]], to: [max[0], 0, max[2]], offset: [0, 18] },
    { from: [max[0], 0, max[2]], to: [max[0], max[1], max[2]], offset: [30, 0] },
    { from: [max[0], 0, max[2]], to: [max[0], 0, min[2]], offset: [24, 14] },
  ];
  return (
    <g>
      <path d={wireBounds(min, max, proj)} fill="none" stroke="#ffe600" strokeOpacity={0.55} strokeDasharray="6 5" />
      {dims.map((d, i) => {
        const [x0, y0] = proj.point(d.from);
        const [x1, y1] = proj.point(d.to);
        const x = (x0 + x1) / 2 + d.offset[0];
        const y = (y0 + y1) / 2 + d.offset[1];
        return (
          <g key={i} className="origin-center [transform-box:fill-box] max-sm:scale-[1.75]">
            <rect x={x - 25} y={y - 10} width={50} height={18} fill="#ffe600" />
            <text x={x} y={y + 3} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#0a0a0a" style={MONO}>
              18.00&quot;
            </text>
          </g>
        );
      })}
    </g>
  );
}

function AxisGizmo({ proj }: { proj: Projector }) {
  const origin: [number, number] = [52, H - 50];
  const axes: { label: string; v: Vec3; color: string }[] = [
    { label: "X", v: [1, 0, 0], color: "#ffffff" },
    { label: "Y", v: [0, 1, 0], color: "#ffe600" },
    { label: "Z", v: [0, 0, 1], color: "#9ca3af" },
  ];
  return (
    <g aria-hidden="true">
      {axes.map((a) => {
        const [dx, dy] = proj.vec(a.v);
        const k = 26 / proj.pxPerInch;
        const x = origin[0] + dx * k;
        const y = origin[1] + dy * k;
        return (
          <g key={a.label}>
            <line
              x1={origin[0]}
              y1={origin[1]}
              x2={x}
              y2={y}
              stroke={a.color}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <text
              x={origin[0] + dx * k * 1.38}
              y={origin[1] + dy * k * 1.38 + 3.5}
              textAnchor="middle"
              fontSize={10}
              fill={a.color}
              style={MONO}
            >
              {a.label}
            </text>
          </g>
        );
      })}
      <circle cx={origin[0]} cy={origin[1]} r={2.5} fill="#ffffff" />
    </g>
  );
}

/** Interactive wireframe "CAD viewer" that highlights the selected subsystem. */
export function RobotBlueprint({ active, className }: { active: Subsystem; className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { margin: "120px" });
  const reduce = useReducedMotion();
  const [view, setView] = useState<View>(PRESETS.iso.view);
  const [preset, setPreset] = useState<PresetId | null>("iso");
  const viewRef = useRef<View>(PRESETS.iso.view);
  const input = useRef({ dragging: false, x: 0, y: 0, lastInput: -Infinity });
  const tween = useRef<AnimationPlaybackControls | null>(null);

  const apply = (v: View) => {
    viewRef.current = v;
    setView(v);
  };

  // Idle turntable.
  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!input.current.dragging && !tween.current && now - input.current.lastInput > 2800) {
        apply({ ...viewRef.current, yaw: viewRef.current.yaw + dt * 0.3 });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  useEffect(() => () => tween.current?.stop(), []);

  // `time` is the triggering event's timeStamp (same clock as performance.now()).
  const goTo = (id: PresetId, time: number) => {
    tween.current?.stop();
    setPreset(id);
    input.current.lastInput = time;
    const from = viewRef.current;
    const to = PRESETS[id].view;
    // Shortest way around for yaw.
    let dYaw = (to.yaw - from.yaw) % (Math.PI * 2);
    if (dYaw > Math.PI) dYaw -= Math.PI * 2;
    if (dYaw < -Math.PI) dYaw += Math.PI * 2;
    tween.current = animate(0, 1, {
      duration: reduce ? 0 : 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (t) => apply({ yaw: from.yaw + dYaw * t, pitch: from.pitch + (to.pitch - from.pitch) * t }),
      onComplete: () => {
        tween.current = null;
        input.current.lastInput = performance.now();
      },
    });
  };

  const nudge = (dYaw: number, dPitch: number, time: number) => {
    tween.current?.stop();
    tween.current = null;
    setPreset(null);
    input.current.lastInput = time;
    const v = viewRef.current;
    apply({ yaw: v.yaw + dYaw, pitch: clamp(v.pitch + dPitch, PITCH_MIN, PITCH_MAX) });
  };

  const scene = useMemo(() => {
    const proj = createProjector(view, { cx: W / 2, cy: H * 0.53, scale: 15.5, target: robotCenter });
    return {
      proj,
      wire: renderWireframe(robotParts, proj),
      grid: groundGrid(15, 3, 0, proj),
      callouts: layoutCallouts(callouts[active], proj),
    };
  }, [view, active]);

  return (
    <div ref={frameRef} className={cn("relative", className)}>
      <div className="relative overflow-hidden border border-white/10 bg-[#0b0b0b]">
        <div aria-hidden="true" className="absolute inset-0 bg-grid-fine opacity-80" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(255,230,0,0.08),transparent_60%)]"
        />

        <div
          role="group"
          tabIndex={0}
          aria-roledescription="interactive 3D model"
          aria-label="Robot wireframe. Drag, or use the arrow keys, to rotate."
          className="relative cursor-grab touch-pan-y outline-none select-none focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-inset active:cursor-grabbing"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            tween.current?.stop();
            tween.current = null;
            setPreset(null);
            input.current = { ...input.current, dragging: true, x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const it = input.current;
            if (!it.dragging) return;
            const dx = e.clientX - it.x;
            const dy = e.clientY - it.y;
            it.x = e.clientX;
            it.y = e.clientY;
            it.lastInput = performance.now();
            const v = viewRef.current;
            apply({ yaw: v.yaw - dx * 0.009, pitch: clamp(v.pitch + dy * 0.007, PITCH_MIN, PITCH_MAX) });
          }}
          onPointerUp={() => {
            input.current.dragging = false;
            input.current.lastInput = performance.now();
          }}
          onPointerCancel={() => {
            input.current.dragging = false;
          }}
          onKeyDown={(e) => {
            const step = {
              ArrowLeft: [deg(8), 0],
              ArrowRight: [deg(-8), 0],
              ArrowUp: [0, deg(-5)],
              ArrowDown: [0, deg(5)],
            }[e.key];
            if (!step) return;
            e.preventDefault();
            nudge(step[0], step[1], e.timeStamp);
          }}
        >
          <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
            <defs>
              <filter id="bp-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {scene.grid.map((line, i) => (
              <path key={i} d={line.d} stroke="#ffffff" strokeOpacity={0.09 * line.opacity} />
            ))}

            {SYSTEMS.map((sys) => (
              <path key={sys} d={scene.wire[sys]} fill="none" stroke="#ffffff" strokeOpacity={0.2} strokeWidth={0.8} />
            ))}

            <m.g key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <path d={scene.wire.fills[active]} fill="#ffe600" fillOpacity={0.06} />
              <path d={scene.wire[active]} fill="none" stroke="#ffe600" strokeWidth={1.25} filter="url(#bp-glow)" />
              {active === "frame" && <SizingEnvelope proj={scene.proj} />}
              <g className="max-sm:hidden">
                {scene.callouts.map((c) => (
                  <Callout key={c.id} c={c} reduce={reduce} />
                ))}
              </g>
              <g className="sm:hidden">
                {scene.callouts.map((c, i) => (
                  <Marker key={c.id} c={c} n={i + 1} />
                ))}
              </g>
            </m.g>

            <g className="max-sm:hidden">
              <AxisGizmo proj={scene.proj} />
            </g>
          </svg>
        </div>

        {/* HUD chrome */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
          <p className="font-mono text-[10px] leading-relaxed tracking-[0.18em] text-mute">
            <span className="hidden sm:inline">CAD VIEWER </span>
            <span className="text-white/30">{"//"}</span> <span className="text-white">SPIRIT_R1</span>
            <span className="hidden text-white sm:inline">.ASM</span>
            <br />
            <span className="text-volt">WIREFRAME</span>
          </p>
          <div
            role="group"
            aria-label="Camera presets"
            className="pointer-events-auto flex border border-white/15 bg-ink/80 backdrop-blur"
          >
            {(Object.keys(PRESETS) as PresetId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={(e) => goTo(id, e.timeStamp)}
                aria-pressed={preset === id}
                className={cn(
                  "px-2.5 py-1.5 font-mono text-[10px] font-semibold tracking-[0.14em] transition-colors sm:px-3",
                  preset === id ? "bg-volt text-ink" : "text-mute hover:bg-white/5 hover:text-white",
                )}
              >
                {PRESETS[id].label}
              </button>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-end gap-3 p-3 font-mono text-[10px] tracking-[0.18em] text-mute sm:p-4">
          <span className="tabular-nums">
            YAW {wrapDeg(view.yaw).toFixed(0).padStart(3, "0")}° · PITCH{" "}
            {((view.pitch * 180) / Math.PI).toFixed(0).padStart(2, "0")}°
          </span>
          <span className="hidden items-center gap-1.5 text-white/70 sm:flex">
            <Rotate3d className="size-3.5 text-volt" aria-hidden="true" /> DRAG TO ROTATE
          </span>
        </div>
      </div>
      <HudCorners className="-m-2" />

      {/* Phone legend for the numbered markers */}
      <ol className="mt-4 grid gap-2 sm:hidden" aria-label="Highlighted components">
        {callouts[active].map((c, i) => (
          <li key={c.id} className="flex items-center gap-3 border border-white/10 bg-ink/60 px-3 py-2.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-volt font-mono text-[11px] font-bold text-ink">
              {i + 1}
            </span>
            <span className="font-mono text-[11px] font-semibold tracking-[0.12em] text-white">{c.label}</span>
            <span className="ml-auto text-right font-mono text-[9.5px] tracking-[0.12em] text-mute">{c.sub}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
