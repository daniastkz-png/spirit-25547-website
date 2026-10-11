import { Box, ChevronDown, Crosshair as CrosshairIcon, FileDown, ScanEye, ScanLine } from "lucide-react";
import { LiveTelemetry } from "@/components/hero/live-telemetry";
import { RobotRender } from "@/components/robot/robot-render";
import { ButtonLink } from "@/components/ui/button";
import { Container, HudCorners, MonoTag, StatusDot } from "@/components/ui/primitives";
import { awards, heroBadges, site } from "@/lib/site";
import { cn } from "@/lib/utils";

// The entrance runs on CSS keyframes (see globals.css) so the hero, the page's LCP
// element, paints and animates immediately instead of waiting for hydration.
const delay = (seconds: number, extra?: Record<string, string>) =>
  ({ "--delay": `${seconds}s`, ...extra }) as React.CSSProperties;

const badgeIcons = { sizing: Box, auto: CrosshairIcon, vision: ScanEye } as const;

const awardsTotal = awards.length;

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24"
    >
      <HeroBackdrop />

      <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-6 xl:gap-10">
        <div className="lg:col-span-6">
          <div
            style={delay(0.15)}
            className="enter-rise inline-flex items-center gap-3 border border-volt/30 bg-volt/[0.06] px-3 py-2 backdrop-blur-sm"
          >
            <StatusDot />
            <MonoTag className="text-[10px] tracking-[0.08em] xs:tracking-[0.16em] sm:text-[11px] sm:tracking-[0.24em]">
              FIRST TECH CHALLENGE • TEAM #{site.teamNumber}
            </MonoTag>
          </div>

          <h1 className="mt-7">
            <span className="sr-only">
              SPIRIT, FIRST Tech Challenge robotics team #{site.teamNumber}. Unleash the drive.
            </span>
            <span
              aria-hidden="true"
              data-text="SPIRIT"
              className="glitch block font-display-xc text-[clamp(6.75rem,42vw,12.5rem)] leading-[0.8] font-black tracking-[-0.01em] text-white uppercase text-shadow-glow lg:text-[clamp(8rem,14.5vw,15.5rem)]"
            >
              {"SPIRIT".split("").map((ch, i) => (
                <span key={i} style={delay(0.24 + i * 0.055)} className="enter-letter inline-block">
                  {ch}
                </span>
              ))}
            </span>
            <span
              aria-hidden="true"
              style={delay(0.42)}
              className="enter-rise mt-4 flex items-center gap-4 font-display text-[clamp(1.65rem,5.4vw,3rem)] leading-none font-extrabold tracking-[0.03em] text-volt uppercase lg:text-[clamp(1.9rem,3.2vw,3rem)]"
            >
              <span className="inline-block -skew-x-12">Unleash the drive.</span>
              <span className="hidden h-px flex-1 bg-gradient-to-r from-volt/60 to-transparent sm:block" />
            </span>
          </h1>

          <p style={delay(0.51)} className="enter-rise mt-7 max-w-xl text-lg leading-relaxed text-mute sm:text-xl">
            Engineering the future of autonomous robotics through precision CAD, agile programming, and relentless
            passion.
          </p>

          <div style={delay(0.6)} className="enter-rise mt-10 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="#robot" className="sm:w-auto">
              <ScanLine className="size-5" strokeWidth={2.4} aria-hidden="true" />
              Inspect the bot
            </ButtonLink>
            <ButtonLink
              href={site.portfolio.href}
              download={site.portfolio.fileName}
              variant="ghost"
              className="sm:w-auto"
            >
              <FileDown className="size-5 text-volt" aria-hidden="true" />
              Download portfolio
              <span className="border border-volt/50 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.12em] text-volt">
                PDF
              </span>
            </ButtonLink>
          </div>

          <dl
            style={delay(0.69)}
            className="enter-rise mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-6"
          >
            {[
              ["Base", site.location.short],
              ["Rookie year", String(site.rookieYear)],
              ["Awards", String(awardsTotal)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[10px] tracking-[0.2em] text-mute uppercase">{label}</dt>
                <dd className="mt-1.5 font-display text-lg font-bold tracking-wide text-white uppercase sm:text-xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div style={delay(0.35)} className="enter-pop lg:col-span-6">
          <RobotShowcase />
        </div>
      </Container>

      <a
        href="#team"
        className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-mute transition-colors hover:text-volt lg:flex"
      >
        SCROLL
        <ChevronDown className="size-4 motion-safe:animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}

function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_75%_65%_at_65%_45%,black_15%,transparent_75%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_75%_45%,rgba(255,230,0,0.13),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_0%_100%,rgba(255,170,0,0.10),transparent_70%)]" />
      <div className="absolute inset-0 scanlines opacity-50" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
    </div>
  );
}

function RobotShowcase() {
  return (
    <div className="mx-auto w-full max-w-[38rem] lg:max-w-none">
      <div className="relative">
        <div className="relative aspect-square overflow-hidden border border-white/10 bg-[#0b0b0b] shadow-[0_0_80px_-20px_rgba(255,230,0,0.25)]">
          <div className="absolute inset-0 bg-grid-fine [mask-image:radial-gradient(circle_at_50%_55%,black_25%,transparent_72%)] opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(255,230,0,0.14),transparent_55%)]" />

          <RobotRender className="absolute inset-0 size-full" />

          {/* Sweeping scan line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 h-28 -translate-y-1/2 bg-gradient-to-b from-transparent via-volt/[0.07] to-transparent motion-safe:animate-scan"
          >
            <div className="absolute inset-x-0 top-1/2 h-px bg-volt/40" />
          </div>

          {/* Reticle */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            className="pointer-events-none absolute top-[47%] left-1/2 size-[44%] -translate-x-1/2 -translate-y-1/2 opacity-60"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#ffe600"
              strokeOpacity="0.25"
              strokeWidth="0.4"
              strokeDasharray="1 3"
            />
            <path d="M50 0v8M50 92v8M0 50h8M92 50h8" stroke="#ffe600" strokeOpacity="0.6" strokeWidth="0.6" />
          </svg>

          {/* Frame header */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-white/10 bg-ink/70 px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] text-mute backdrop-blur-md">
            <span>
              CAM_01 <span className="text-white/30">{"//"}</span> CHASSIS ISO
            </span>
            <span className="flex items-center gap-2 text-volt">
              <StatusDot className="size-1.5" /> LIVE
            </span>
          </div>

          <LiveTelemetry />
        </div>
        <HudCorners className="-m-2.5" />

        {/* Floating telemetry badges */}
        {heroBadges.map((badge, i) => {
          const Icon = badgeIcons[badge.id];
          return (
            <div
              key={badge.id}
              style={delay(1.1 + i * 0.18)}
              className={cn(
                "enter-pop absolute z-10 hidden lg:block",
                badge.id === "sizing" && "top-[15%] -left-6 xl:-left-10",
                badge.id === "auto" && "top-[44%] -right-4 xl:-right-8",
                badge.id === "vision" && "-bottom-5 left-[9%]",
              )}
            >
              <div className="float-y" style={delay(i * 0.7, { "--float-duration": `${5 + i}s` })}>
                <Badge icon={<Icon className="size-4" aria-hidden="true" />} label={badge.label} />
              </div>
            </div>
          );
        })}
      </div>

      <ul className="mt-6 flex flex-wrap justify-center gap-2 lg:hidden">
        {heroBadges.map((badge) => {
          const Icon = badgeIcons[badge.id];
          return (
            <li key={badge.id}>
              <Badge icon={<Icon className="size-4" aria-hidden="true" />} label={badge.label} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 border border-volt/40 bg-ink/85 px-3 py-2 font-mono text-[10.5px] font-medium tracking-[0.16em] text-white shadow-glow backdrop-blur-md">
      <span className="grid size-6 place-items-center bg-volt text-ink">{icon}</span>
      {label}
    </div>
  );
}
