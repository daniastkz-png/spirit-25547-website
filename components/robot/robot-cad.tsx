"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { Minus, Plus, Rotate3d } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import { HudCorners } from "@/components/ui/primitives";
import { CAD_MODEL, CAD_TARGET, loadModelViewer } from "@/lib/robot/cad";
import { cn } from "@/lib/utils";

// model-viewer can't size the model itself (see CAD_TARGET), so the zoom range is fixed here.
const RADIUS = { min: 0.6, max: 2.4 };

const PRESETS = {
  iso: { label: "ISO", orbit: "35deg 68deg 1.55m" },
  front: { label: "FRONT", orbit: "0deg 85deg 1.45m" },
  side: { label: "SIDE", orbit: "90deg 85deg 1.45m" },
  top: { label: "TOP", orbit: "0deg 1deg 1.55m" },
} as const;

type PresetId = keyof typeof PRESETS;

/** Interactive viewer for the robot's real CAD. model-viewer is fetched only once the frame nears the viewport. */
export function RobotCad({ className }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ModelViewerElement>(null);
  const near = useInView(frameRef, { once: true, margin: "400px" });
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [preset, setPreset] = useState<PresetId | null>("iso");
  const [orbit, setOrbit] = useState<string>(PRESETS.iso.orbit);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    loadModelViewer()
      .then(() => !cancelled && setReady(true))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [near]);

  useEffect(() => {
    const el = viewerRef.current;
    if (!ready || !el) return;
    const onProgress = (e: Event) => setProgress((e as CustomEvent<{ totalProgress: number }>).detail.totalProgress);
    const onLoad = () => setLoaded(true);
    const onError = () => setFailed(true);
    const onCamera = (e: Event) => {
      if ((e as CustomEvent<{ source: string }>).detail.source === "user-interaction") setPreset(null);
    };
    el.addEventListener("progress", onProgress);
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    el.addEventListener("camera-change", onCamera);
    return () => {
      el.removeEventListener("progress", onProgress);
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
      el.removeEventListener("camera-change", onCamera);
    };
  }, [ready]);

  const goTo = (id: PresetId) => {
    setPreset(id);
    setOrbit(PRESETS[id].orbit);
  };

  // Scroll-wheel zoom is off so the page keeps scrolling; these buttons zoom instead.
  const zoom = (factor: number) => {
    const el = viewerRef.current;
    if (!el || !loaded) return;
    const { theta, phi, radius } = el.getCameraOrbit();
    const r = Math.min(RADIUS.max, Math.max(RADIUS.min, radius * factor));
    setPreset(null);
    setOrbit(`${theta}rad ${phi}rad ${r}m`);
  };

  return (
    <div ref={frameRef} className={cn("relative", className)}>
      <div className="relative aspect-[8/7] overflow-hidden border border-white/10 bg-[#0b0b0b]">
        <div aria-hidden="true" className="absolute inset-0 bg-grid-fine opacity-80" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(255,230,0,0.08),transparent_60%)]"
        />

        {ready && (
          <model-viewer
            ref={viewerRef}
            src={CAD_MODEL.src}
            alt="3D CAD model of Aldente 3, SPIRIT's competition robot"
            camera-controls=""
            disable-zoom=""
            touch-action="pan-y"
            interaction-prompt="none"
            camera-target={CAD_TARGET}
            camera-orbit={orbit}
            min-camera-orbit={`auto 0deg ${RADIUS.min}m`}
            max-camera-orbit={`auto 100deg ${RADIUS.max}m`}
            field-of-view="30deg"
            environment-image="neutral"
            exposure="1"
            shadow-intensity="0"
            {...(reduce ? {} : { "auto-rotate": "", "auto-rotate-delay": "2800", "rotation-per-second": "14deg" })}
            className={cn(
              "absolute inset-0 size-full bg-transparent transition-opacity duration-700 outline-none focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-inset",
              loaded ? "opacity-100" : "opacity-0",
            )}
          />
        )}

        {!loaded && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="flex w-48 flex-col items-center gap-3">
              <p className="font-mono text-[10px] tracking-[0.2em] text-mute">
                {failed ? "CAD UNAVAILABLE" : `LOADING CAD · ${CAD_MODEL.size}`}
              </p>
              {!failed && (
                <div className="h-0.5 w-full bg-white/10">
                  <div
                    className="h-full origin-left bg-volt transition-transform duration-300"
                    style={{ transform: `scaleX(${progress})` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* HUD chrome */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
          <p className="font-mono text-[10px] leading-relaxed tracking-[0.18em] text-mute">
            <span className="hidden sm:inline">CAD VIEWER </span>
            <span className="text-white/30">{"//"}</span> <span className="text-white">ALDENTE_3</span>
            <span className="hidden text-white sm:inline">.ASM</span>
            <br />
            <span className="text-volt">ONSHAPE EXPORT</span>
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
                onClick={() => goTo(id)}
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 font-mono text-[10px] tracking-[0.18em] text-mute sm:p-4">
          <div
            role="group"
            aria-label="Zoom"
            className="pointer-events-auto flex border border-white/15 bg-ink/80 backdrop-blur"
          >
            <button
              type="button"
              onClick={() => zoom(0.8)}
              aria-label="Zoom in"
              className="grid size-8 place-items-center text-mute transition-colors hover:bg-white/5 hover:text-white"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => zoom(1.25)}
              aria-label="Zoom out"
              className="grid size-8 place-items-center border-l border-white/15 text-mute transition-colors hover:bg-white/5 hover:text-white"
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <span className="flex items-center gap-1.5 text-white/70">
            <Rotate3d className="size-3.5 text-volt" aria-hidden="true" /> DRAG TO ROTATE
          </span>
        </div>
      </div>
      <HudCorners className="-m-2" />
    </div>
  );
}
