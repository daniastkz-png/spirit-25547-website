import { BookOpen, FileDown } from "lucide-react";
import { SpiritFlame } from "@/components/brand/spirit-flame";
import { ButtonLink } from "@/components/ui/button";
import { Container, HudCorners, MonoTag, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { createProjector, deg, renderWireframe } from "@/lib/robot/engine";
import { robotCenter, robotParts } from "@/lib/robot/model";
import { portfolioChapters, site } from "@/lib/site";
import { pad } from "@/lib/utils";

// Static wireframe for the "Robot design" page thumbnail, computed at build time.
const thumbWire = (() => {
  const proj = createProjector({ yaw: deg(40), pitch: deg(22) }, { cx: 60, cy: 64, scale: 3.1, target: robotCenter });
  const w = renderWireframe(robotParts, proj);
  return { all: w.frame + w.drivetrain + w.vision, scoring: w.scoring };
})();

export function Portfolio() {
  return (
    <section id="portfolio" className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-50"
      />

      <Container className="relative">
        <Reveal>
          <SectionHeader
            index="05"
            kicker="Engineering Portfolio"
            title={
              <>
                Documented. Defended. <span className="text-volt">Downloadable.</span>
              </>
            }
            description="Judges read our portfolio before they ever meet us. It is the full record of how SPIRIT designs, tests and iterates, and it is yours to download."
          />
        </Reveal>

        <Reveal className="mt-14" delay={0.05}>
          <div className="group/card relative grid overflow-hidden border border-white/10 bg-carbon lg:grid-cols-2">
            <HudCorners inset={8} className="z-10" />
            <div className="relative p-6 sm:p-10 lg:p-12">
              <div className="flex items-center gap-3">
                <BookOpen className="size-5 text-volt" aria-hidden="true" />
                <MonoTag>Season portfolio {"//"} PDF</MonoTag>
              </div>
              <h3 className="mt-5 font-display text-4xl leading-[0.95] font-extrabold tracking-tight text-white uppercase sm:text-5xl">
                The SPIRIT engineering portfolio
              </h3>
              <p className="mt-4 max-w-lg leading-relaxed text-mute">
                Design iterations, CAD, code architecture, testing data, outreach and our business plan, condensed into
                the document we present to FTC judges.
              </p>

              <ol className="mt-8 border-t border-white/10">
                {portfolioChapters.map((chapter, i) => (
                  <li key={chapter} className="flex items-center gap-4 border-b border-white/10 py-3">
                    <span className="font-mono text-xs text-volt">{pad(i + 1)}</span>
                    <span className="font-display text-base font-semibold tracking-wide text-white/90 uppercase">
                      {chapter}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                <ButtonLink href={site.portfolio.href} download={site.portfolio.fileName}>
                  <FileDown className="size-5" aria-hidden="true" />
                  Download portfolio
                </ButtonLink>
                <p className="font-mono text-[10px] leading-relaxed tracking-[0.18em] text-mute uppercase">
                  Format: PDF
                  <br />
                  Team #{site.teamNumber} · {site.location.short}
                </p>
              </div>
            </div>

            <PageStack />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

const pageBase =
  "absolute aspect-[8.5/11] w-[min(52%,15rem)] origin-bottom overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-snap";

/** Fanned stack of page previews that spreads out on hover. */
function PageStack() {
  return (
    <div
      aria-hidden="true"
      className="relative min-h-[26rem] overflow-hidden border-t border-white/10 bg-ink lg:min-h-0 lg:border-t-0 lg:border-l"
    >
      <div className="absolute inset-0 bg-grid-fine opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(255,230,0,0.12),transparent_60%)]" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative h-[80%] w-full">
          {/* Outreach page */}
          <div
            className={`${pageBase} bottom-[6%] left-1/2 -translate-x-[95%] -rotate-[14deg] bg-[#f4f4f1] group-hover/card:-translate-x-[118%] group-hover/card:-rotate-[18deg]`}
          >
            <div className="h-1.5 bg-volt" />
            <div className="space-y-2 p-3">
              <div className="h-2 w-3/5 bg-ink/80" />
              <div className="grid grid-cols-2 gap-1.5">
                <div className="aspect-[4/3] bg-ink/25" />
                <div className="aspect-[4/3] bg-ink/15" />
                <div className="col-span-2 aspect-[16/7] bg-ink/20" />
              </div>
              {[90, 75, 85, 60].map((w) => (
                <div key={w} className="h-1 bg-ink/20" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          {/* Software page */}
          <div
            className={`${pageBase} bottom-[4%] left-1/2 -translate-x-[70%] -rotate-[5deg] bg-[#111] group-hover/card:-translate-x-[78%] group-hover/card:-rotate-[7deg]`}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="h-1.5 w-1/3 bg-white/70" />
              <div className="h-1.5 w-6 bg-volt" />
            </div>
            <div className="space-y-1.5 p-3 font-mono">
              {[
                [12, 40, "bg-volt/80"],
                [20, 55, "bg-white/50"],
                [20, 35, "bg-white/30"],
                [28, 45, "bg-blaze/70"],
                [28, 30, "bg-white/40"],
                [20, 50, "bg-white/30"],
                [12, 20, "bg-volt/80"],
                [12, 60, "bg-white/40"],
                [20, 42, "bg-white/30"],
                [20, 28, "bg-blaze/70"],
              ].map(([indent, width, color], i) => (
                <div key={i} className={`h-1 ${color}`} style={{ marginLeft: `${indent}%`, width: `${width}%` }} />
              ))}
            </div>
          </div>
          {/* Robot design page */}
          <div
            className={`${pageBase} bottom-[3%] left-1/2 -translate-x-[40%] rotate-[4deg] bg-[#0c0c0c] group-hover/card:-translate-x-[30%] group-hover/card:rotate-[7deg]`}
          >
            <div className="absolute inset-0 bg-grid-fine opacity-80" />
            <svg viewBox="0 0 120 120" className="relative mt-4 w-full">
              <path d={thumbWire.all} fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.4" />
              <path d={thumbWire.scoring} fill="none" stroke="#ffe600" strokeWidth="0.6" />
            </svg>
            <div className="relative space-y-1.5 px-3">
              <div className="h-1.5 w-1/2 bg-volt" />
              <div className="h-1 w-4/5 bg-white/30" />
              <div className="h-1 w-3/5 bg-white/30" />
            </div>
          </div>
          {/* Cover */}
          <div
            className={`${pageBase} bottom-0 left-1/2 -translate-x-[8%] rotate-[13deg] border-volt/50 bg-ink group-hover/card:translate-x-[12%] group-hover/card:rotate-[17deg]`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,200,0,0.3),transparent_60%)]" />
            <div className="relative flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
              <SpiritFlame id="portfolio-cover" className="w-1/3 drop-shadow-[0_0_12px_rgba(255,200,0,0.6)]" />
              <p className="font-display-xc text-3xl leading-none font-black text-white">SPIRIT</p>
              <p className="font-mono text-[7px] tracking-[0.25em] text-volt">ENGINEERING PORTFOLIO</p>
              <p className="font-mono text-[6px] tracking-[0.25em] text-mute">FTC #{site.teamNumber}</p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-2 bg-hazard" />
          </div>
        </div>
      </div>
    </div>
  );
}
