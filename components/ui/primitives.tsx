import { cn } from "@/lib/utils";

/** Page-width wrapper with fluid gutters (16px on phones). */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-10", className)}>{children}</div>;
}

/** Monospace HUD metadata tag, rendered as `[ LABEL ]`. */
export function MonoTag({
  children,
  tone = "volt",
  brackets = true,
  className,
}: {
  children: React.ReactNode;
  tone?: "volt" | "mute" | "white";
  brackets?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.22em] uppercase",
        tone === "volt" && "text-volt",
        tone === "mute" && "text-mute",
        tone === "white" && "text-white",
        className,
      )}
    >
      {brackets && <span aria-hidden="true">[</span>}
      {children}
      {brackets && <span aria-hidden="true">]</span>}
    </span>
  );
}

/** Four L-shaped HUD brackets pinned to the corners of the nearest positioned ancestor. */
export function HudCorners({ className, inset = 0 }: { className?: string; inset?: number }) {
  const base = "pointer-events-none absolute size-3.5 border-volt transition-all duration-300";
  const style = { margin: inset };
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <span style={style} className={cn(base, "top-0 left-0 border-t-2 border-l-2")} />
      <span style={style} className={cn(base, "top-0 right-0 border-t-2 border-r-2")} />
      <span style={style} className={cn(base, "bottom-0 left-0 border-b-2 border-l-2")} />
      <span style={style} className={cn(base, "right-0 bottom-0 border-r-2 border-b-2")} />
    </span>
  );
}

/** Pulsing status dot. */
export function StatusDot({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative inline-flex size-2", className)}>
      <span className="absolute inline-flex size-full rounded-full bg-volt opacity-70 motion-safe:animate-ping" />
      <span className="relative inline-flex size-2 rounded-full bg-volt" />
    </span>
  );
}

export function SectionHeader({
  index,
  kicker,
  title,
  description,
  align = "left",
  className,
}: {
  index: string;
  kicker: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <div className={cn("flex items-center gap-3", align === "center" && "justify-center")}>
        <MonoTag>
          {index} {"//"} {kicker}
        </MonoTag>
        <span aria-hidden="true" className="h-px w-16 bg-gradient-to-r from-volt/70 to-transparent" />
      </div>
      <h2 className="mt-5 font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.9] font-extrabold tracking-tight text-white uppercase">
        {title}
      </h2>
      {description && <p className="mt-5 max-w-2xl text-base leading-relaxed text-mute sm:text-lg">{description}</p>}
    </div>
  );
}
