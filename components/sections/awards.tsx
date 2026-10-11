import { Maximize2, Medal, Trophy } from "lucide-react";
import Image from "next/image";
import { Container, HudCorners, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { awards, type Award } from "@/lib/site";
import { cn, pad } from "@/lib/utils";

/** Certificate wall: every judged award, newest first, with the photo of the certificate. */
export function Awards() {
  return (
    <section id="awards" className="relative overflow-hidden py-24 lg:py-32">
      <div aria-hidden="true" className="absolute inset-0 bg-dots opacity-30" />
      <div
        aria-hidden="true"
        className="absolute -top-20 right-0 size-[36rem] bg-[radial-gradient(circle,rgba(255,208,0,0.09),transparent_65%)]"
      />

      <Container className="relative">
        <Reveal>
          <SectionHeader
            index="03"
            kicker="Awards"
            title={
              <>
                Our <span className="text-volt">Awards</span>
              </>
            }
            description="FIRST judged awards recognize the whole team: the robot, the engineering process and the impact we make off the field. Click a certificate to see it full size."
          />
        </Reveal>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:gap-6">
          {awards.map((award, i) => (
            <Reveal as="li" key={award.image} delay={(i % 2) * 0.08}>
              <AwardCard award={award} index={i + 1} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function AwardCard({ award, index }: { award: Award; index: number }) {
  const winner = award.placement === "Winner";
  const Icon = winner ? Trophy : Medal;
  const title = `${award.name}, ${award.placement} — ${award.event}${award.year ? ` ${award.year}` : ""}`;

  return (
    <a
      href={award.fullImage}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View certificate: ${title}`}
      className="group relative flex h-full flex-col border border-white/10 bg-carbon transition-[border-color,box-shadow] duration-300 hover:border-volt/60 hover:shadow-glow"
    >
      <div className="relative aspect-[1400/990] overflow-hidden">
        <Image
          src={award.image}
          alt={`Certificate: ${title}`}
          width={1400}
          height={990}
          sizes="(min-width: 640px) 45vw, 100vw"
          className="size-full object-cover saturate-[0.9] transition-[transform,filter] duration-700 ease-snap group-hover:scale-[1.03] group-hover:saturate-100"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-volt transition-transform duration-500 group-hover:scale-x-100"
        />

        <span
          className={cn(
            "absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.16em] uppercase sm:text-[11px]",
            winner ? "bg-volt text-ink shadow-glow" : "border border-volt/60 bg-ink/85 text-volt backdrop-blur-sm",
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
          {award.placement}
        </span>
        <span
          aria-hidden="true"
          className="absolute top-3 right-3 bg-ink/75 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.18em] text-white/80 backdrop-blur-sm"
        >
          {pad(index)}
        </span>
        <span
          aria-hidden="true"
          className="absolute right-3 bottom-3 grid size-9 place-items-center border border-white/20 bg-ink/80 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
        >
          <Maximize2 className="size-4" />
        </span>
      </div>

      <div className="flex flex-1 items-end justify-between gap-4 p-5 sm:p-6">
        <div>
          <h3 className="font-display text-2xl leading-tight font-extrabold tracking-wide text-white uppercase sm:text-3xl">
            {award.name}
          </h3>
          <p className="mt-1.5 font-mono text-[11px] tracking-[0.16em] text-mute uppercase">{award.event}</p>
        </div>
        {award.year && (
          <span className="shrink-0 font-display-xc text-3xl leading-none font-black text-white/25 transition-colors duration-300 group-hover:text-volt sm:text-4xl">
            {award.year}
          </span>
        )}
      </div>

      <HudCorners className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" inset={5} />
    </a>
  );
}
