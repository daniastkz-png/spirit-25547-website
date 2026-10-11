"use client";

import { m } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts its children into view the first time they scroll on screen. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "article" | "section";
}) {
  const Component = m[as];
  return (
    <Component
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.75, delay, ease }}
    >
      {children}
    </Component>
  );
}
