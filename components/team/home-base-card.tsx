import { MapPin } from "lucide-react";
import Image from "next/image";
import { HudCorners, MonoTag, StatusDot } from "@/components/ui/primitives";
import { site } from "@/lib/site";

/** Photo card of the team's home base, with the venue name and location over the image. */
export function HomeBaseCard() {
  return (
    <figure className="group relative">
      <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-carbon sm:aspect-[5/4] lg:aspect-[4/5]">
        <Image
          src={site.homeBaseImage}
          alt={`${site.homeBase} in ${site.location.city}, with the statue of Al-Farabi in front`}
          width={1050}
          height={700}
          sizes="(min-width: 1024px) 34rem, 100vw"
          className="size-full object-cover object-[42%_center] transition-transform duration-[1.2s] ease-snap group-hover:scale-[1.04]"
        />

        {/* Legibility gradient + HUD chrome */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink via-ink/70 to-transparent"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 scanlines opacity-40" />

        <span className="absolute top-3 left-3 inline-flex items-center gap-2 bg-ink/75 px-2.5 py-1.5 backdrop-blur-md">
          <StatusDot className="size-1.5" />
          <MonoTag className="text-[10px]">Home base</MonoTag>
        </span>

        <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="font-display text-[clamp(1.6rem,3vw,2.25rem)] leading-[0.95] font-extrabold tracking-tight text-white uppercase">
            {site.homeBase}
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.16em] text-white/80 uppercase">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-volt" aria-hidden="true" />
              {site.location.city}, {site.location.country}
            </span>
            <span aria-hidden="true" className="text-white/30">
              {"//"}
            </span>
            <span className="text-mute">{site.location.coordinates}</span>
          </p>
        </figcaption>
      </div>
      <HudCorners className="-m-2" />
    </figure>
  );
}
