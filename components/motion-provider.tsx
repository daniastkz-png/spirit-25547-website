"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

/**
 * App-wide Framer Motion setup: features are code-split and loaded after hydration
 * (`strict` enforces the lightweight `m` components), and every animation honors the
 * visitor's reduced-motion preference.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
