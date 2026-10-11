import { ArrowRight, Award, GraduationCap, Presentation, Share2, type LucideIcon } from "lucide-react";
import { SpiritFlame } from "@/components/brand/spirit-flame";
import { Container, HudCorners, MonoTag, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { awards, outreach, type OutreachId } from "@/lib/site";
import { cn } from "@/lib/utils";

const icons: Record<OutreachId, LucideIcon> = {
  workshops: Presentation,
  mentorship: GraduationCap,
  opensource: Share2,
};

// Community-facing awards (Reach & Connect) from the Awards list.
const impactAwards = awards
  .filter((a) => /^(Connect|Reach)/.test(a.name))
  .map((a) => ({ award: `${a.name} — ${a.placement}`, event: a.event, year: a.year ?? "" }));

export function Outreach() {
  return (
    <section id="outreach" className="relative overflow-hidden border-t border-white/10 bg-carbon py-24 lg:py-32">
      <div aria-hidden="true" className="absolute inset-0 bg-dots opacity-30" />

      <Container className="relative">
        <Reveal>
          <SectionHeader
            index="04"
            kicker="Outreach"
            title={
              <>
                Igniting STEM <span className="text-volt">beyond the field</span>
              </>
            }
            description="The robot is the tool; people are the mission. We run workshops, mentor younger teams and publish what we build so the next generation of engineers starts further ahead."
          />
        </Reveal>

        <ul className="mt-14 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          {outreach.map((item, i) => {
            const Icon = icons[item.id];
            const featured = i === 0;
            return (
              <Reveal as="li" key={item.id} delay={i * 0.08} className={cn(featured && "lg:col-span-2 lg:row-span-2")}>
                <article
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden border border-white/10 bg-ink/70 transition-[border-color,box-shadow] duration-300 hover:border-volt/60 hover:shadow-glow",
                    featured ? "lg:flex-row" : "",
                  )}
                >
                  <HudCorners className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" inset={6} />
                  {featured && <ReachMap />}
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                      <MonoTag>{item.tag}</MonoTag>
                      <span className="grid size-11 place-items-center border border-white/15 text-volt transition-colors duration-300 group-hover:border-volt group-hover:bg-volt group-hover:text-ink">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                    </div>
                    {/* Copy sits at the bottom of tall (bento) cards. */}
                    <div className="mt-auto pt-6">
                      <h3
                        className={cn(
                          "font-display leading-[0.95] font-extrabold tracking-tight text-white uppercase",
                          featured ? "text-4xl sm:text-5xl" : "text-3xl",
                        )}
                      >
                        {item.title}
                      </h3>
                      <p className="mt-4 leading-relaxed text-mute">{item.body}</p>
                      <ul className="mt-6 space-y-2">
                        {item.points.map((point) => (
                          <li
                            key={point}
                            className="flex items-center gap-3 font-mono text-[11px] tracking-[0.16em] text-white/80 uppercase"
                          >
                            <ArrowRight className="size-3.5 text-volt" aria-hidden="true" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>

        {impactAwards.length > 0 && (
          <Reveal className="mt-4">
            <div className="flex flex-col gap-4 border border-volt/30 bg-volt/[0.04] p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
              <p className="flex shrink-0 items-center gap-3 font-display text-lg font-bold tracking-wide text-white uppercase">
                <Award className="size-6 text-volt" aria-hidden="true" />
                Recognized for impact
              </p>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {impactAwards.map((a) => (
                  <li
                    key={`${a.award}-${a.event}`}
                    className="font-mono text-[11px] tracking-[0.14em] text-mute uppercase"
                  >
                    <span className="text-volt">{a.award}</span> · {a.event} {a.year}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}

/** Abstract "community reach" network graphic for the featured outreach card. */
function ReachMap() {
  const nodes = [
    { label: "SCHOOLS", angle: -150, r: 0.78 },
    { label: "FLL TEAMS", angle: -60, r: 0.86 },
    { label: "ROOKIES", angle: 10, r: 0.7 },
    { label: "EVENTS", angle: 80, r: 0.84 },
    { label: "OPEN CAD", angle: 150, r: 0.74 },
  ];
  const R = 118;
  return (
    <div className="relative min-h-72 overflow-hidden border-b border-white/10 lg:min-h-0 lg:w-[46%] lg:border-r lg:border-b-0">
      <div aria-hidden="true" className="absolute inset-0 bg-grid-fine opacity-70" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,230,0,0.14),transparent_60%)]"
      />
      <svg
        aria-hidden="true"
        viewBox="-160 -160 320 320"
        className="absolute inset-0 m-auto size-full max-h-[22rem] max-w-[22rem]"
      >
        <circle r={R} fill="none" stroke="#ffffff" strokeOpacity="0.08" />
        <circle
          r={R * 0.62}
          fill="none"
          stroke="#ffe600"
          strokeOpacity="0.25"
          strokeDasharray="2 6"
          className="origin-center motion-safe:animate-spin-slow"
        />
        <circle r={R * 1.18} fill="none" stroke="#ffe600" strokeOpacity="0.12" />
        {nodes.map((n) => {
          const a = (n.angle * Math.PI) / 180;
          const x = Math.cos(a) * R * n.r * 1.12;
          const y = Math.sin(a) * R * n.r * 1.12;
          return (
            <g key={n.label}>
              <line x1="0" y1="0" x2={x} y2={y} stroke="#ffe600" strokeOpacity="0.45" strokeDasharray="3 4" />
              <rect
                x={x - 5}
                y={y - 5}
                width="10"
                height="10"
                fill="#0a0a0a"
                stroke="#ffe600"
                transform={`rotate(45 ${x} ${y})`}
              />
              <text
                x={x}
                y={y + (y > 0 ? 22 : -14)}
                textAnchor="middle"
                fontSize="10"
                letterSpacing="1.5"
                fill="#ffffff"
                fillOpacity="0.8"
                className="font-mono"
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="absolute top-1/2 left-1/2 w-14 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_20px_rgba(255,200,0,0.6)]">
        <SpiritFlame id="reach-map" />
      </div>
    </div>
  );
}
