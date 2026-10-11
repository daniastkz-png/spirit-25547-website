"use client";

import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, Box, Cog, ScanEye, type LucideIcon, MoveVertical } from "lucide-react";
import { useRef, useState } from "react";
import { RobotBlueprint } from "@/components/robot/robot-blueprint";
import { Container, MonoTag, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { subsystems, type SubsystemId } from "@/lib/site";
import { cn } from "@/lib/utils";

const icons: Record<SubsystemId, LucideIcon> = {
  drivetrain: Cog,
  vision: ScanEye,
  scoring: MoveVertical,
  frame: Box,
};

export function RobotSpecs() {
  const [active, setActive] = useState<SubsystemId>("drivetrain");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = subsystems.find((s) => s.id === active) ?? subsystems[0];

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = subsystems.length - 1;
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(subsystems[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="robot" className="relative overflow-hidden border-y border-white/10 bg-carbon py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] opacity-60"
      />

      <Container className="relative">
        <Reveal>
          <SectionHeader
            index="02"
            kicker="Robot & Tech"
            title={
              <>
                The robot: <span className="text-volt">technical specs</span>
              </>
            }
            description="Four subsystems, one 18-inch cube. Pick a subsystem to light it up in the CAD viewer, then drag the model to inspect it from any angle."
          />
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Subsystem tabs */}
          <Reveal className="lg:col-span-5 xl:col-span-4">
            <div
              role="tablist"
              aria-label="Robot subsystems"
              aria-orientation="vertical"
              className="grid grid-cols-2 gap-2 lg:grid-cols-1"
            >
              {subsystems.map((sys, i) => {
                const Icon = icons[sys.id];
                const selected = sys.id === active;
                return (
                  <button
                    key={sys.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    id={`tab-${sys.id}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls="robot-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(sys.id)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    className={cn(
                      "group relative flex items-center gap-3 border px-3 py-3.5 text-left transition-[border-color,background-color,box-shadow] duration-300 sm:gap-4 sm:px-4 lg:py-4",
                      selected
                        ? "border-volt/70 bg-volt/[0.07] shadow-glow"
                        : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]",
                    )}
                  >
                    {selected && (
                      <m.span
                        layoutId="subsystem-indicator"
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-1 bg-volt"
                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                      />
                    )}
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center border transition-colors duration-300",
                        selected ? "border-volt bg-volt text-ink" : "border-white/15 text-mute group-hover:text-white",
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10px] tracking-[0.2em] text-mute">{sys.code}</span>
                      <span
                        className={cn(
                          "block font-display text-base leading-tight font-bold tracking-[0.06em] uppercase sm:text-lg",
                          selected ? "text-white" : "text-white/75",
                        )}
                      >
                        {sys.name}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className={cn(
                        "hidden size-4 shrink-0 transition-all duration-300 lg:block",
                        selected ? "translate-x-0 text-volt" : "-translate-x-1 text-white/20 group-hover:text-white/50",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* Viewer */}
          <Reveal className="lg:col-span-7 lg:row-span-2 xl:col-span-8" delay={0.1}>
            <RobotBlueprint active={active} />
          </Reveal>

          {/* Details */}
          <div
            id="robot-panel"
            role="tabpanel"
            aria-labelledby={`tab-${active}`}
            className="relative grid lg:col-span-5 xl:col-span-4"
          >
            {/* Old and new panels share one grid cell, so swapping never collapses the height. */}
            <AnimatePresence initial={false}>
              <m.div
                key={current.id}
                className="[grid-area:1/1]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
                transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <MonoTag>
                  {current.code} {"//"} {current.name}
                </MonoTag>
                <h3 className="mt-3 font-display text-2xl leading-tight font-bold text-white sm:text-[1.7rem]">
                  {current.headline}
                </h3>
                <p className="mt-3 leading-relaxed text-mute">{current.description}</p>

                <dl className="mt-6 border-t border-white/10">
                  {current.specs.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-4 border-b border-white/10 py-2.5"
                    >
                      <dt className="font-mono text-[11px] tracking-[0.16em] text-mute uppercase">{label}</dt>
                      <dd className="text-right font-display font-semibold tracking-wide text-white uppercase">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Key technologies">
                  {current.tags.map((tag) => (
                    <li
                      key={tag}
                      className="border border-volt/35 px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] text-volt uppercase"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
