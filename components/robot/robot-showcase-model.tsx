"use client";

import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import { CAD_MODEL, loadModelViewer } from "@/lib/robot/cad";
import { cn } from "@/lib/utils";

// Same camera as the poster render, so the swap to the live model is seamless.
const ORBIT = "38deg 72deg 1.45m";
const TARGET = "0.0175m 0.13m 0.05m";
const POSTER = "/cad/aldente-3-hero.webp";

/**
 * Hero showcase of the real robot. A pre-rendered still paints immediately; once the
 * page has finished loading, the live model fades in over it and turns on a turntable.
 * Reduced-motion users keep the still.
 */
export function RobotShowcaseModel({ className }: { className?: string }) {
  const viewerRef = useRef<ModelViewerElement>(null);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let cancelled = false;
    let timer = 0;
    // Wait for the page to finish loading so the 3D model never competes with first paint.
    const start = () => {
      timer = window.setTimeout(() => {
        loadModelViewer()
          .then(() => !cancelled && setReady(true))
          .catch(() => {});
      }, 600);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("load", start);
    };
  }, [reduce]);

  useEffect(() => {
    const el = viewerRef.current;
    if (!ready || !el) return;
    const onLoad = () => setLoaded(true);
    el.addEventListener("load", onLoad);
    return () => el.removeEventListener("load", onLoad);
  }, [ready]);

  return (
    <div className={className}>
      <Image
        src={POSTER}
        alt="Aldente 3, SPIRIT's competition robot, rendered from the team's Onshape CAD"
        fill
        priority
        sizes="(min-width: 1024px) 40vw, 100vw"
        className={cn("object-contain transition-opacity duration-700", loaded ? "opacity-0" : "opacity-100")}
      />
      {ready && (
        <model-viewer
          ref={viewerRef}
          aria-hidden="true"
          src={CAD_MODEL.src}
          interaction-prompt="none"
          camera-target={TARGET}
          camera-orbit={ORBIT}
          min-camera-orbit="auto 0deg 0.6m"
          max-camera-orbit="auto 100deg 2.4m"
          field-of-view="30deg"
          environment-image="neutral"
          exposure="1"
          shadow-intensity="0"
          auto-rotate=""
          auto-rotate-delay="0"
          rotation-per-second="16deg"
          className={cn(
            "pointer-events-none absolute inset-0 size-full bg-transparent transition-opacity duration-700",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}
