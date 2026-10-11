import { Crown } from "lucide-react";
import Image from "next/image";
import { SpiritFlame } from "@/components/brand/spirit-flame";
import { HudCorners } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { team, type TeamMember } from "@/lib/site";
import { pad } from "@/lib/utils";

/** Grid of member cards: portrait, name, role and a one-line bio. */
export function TeamRoster() {
  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {team.map((member, i) => (
          <Reveal as="li" key={member.name} delay={(i % 3) * 0.08}>
            <MemberCard member={member} index={i + 1} />
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

function MemberCard({ member, index }: { member: TeamMember; index: number }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-carbon transition-[border-color,box-shadow] duration-300 hover:border-volt/60 hover:shadow-glow">
      <div className="relative aspect-[4/5] overflow-hidden">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={`${member.name}, ${member.role}`}
            width={600}
            height={750}
            sizes="(min-width: 1024px) 15rem, (min-width: 640px) 30vw, 50vw"
            className="size-full object-cover saturate-[0.85] transition-[transform,filter] duration-700 ease-snap group-hover:scale-[1.04] group-hover:saturate-100"
          />
        ) : (
          <PhotoPlaceholder />
        )}

        {/* Legibility gradient + HUD chrome */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/55 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 scanlines opacity-0 transition-opacity duration-500 group-hover:opacity-60"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-volt transition-transform duration-500 group-hover:scale-x-100"
        />

        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 bg-volt px-2 py-1 font-mono text-[9.5px] font-bold tracking-[0.14em] text-ink uppercase sm:text-[10px]">
          {member.captain && <Crown className="size-3" aria-hidden="true" />}
          {member.role}
        </span>
        <span
          aria-hidden="true"
          className="absolute top-2.5 right-2.5 bg-ink/70 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.18em] text-white/80 backdrop-blur-sm"
        >
          {pad(index)}
        </span>

        <h4 className="absolute right-3 bottom-2.5 left-3 font-display-xc text-[1.75rem] leading-none font-black tracking-wide text-white uppercase sm:text-[2rem]">
          {member.name}
        </h4>
      </div>

      <p className="flex-1 px-3 pt-3 pb-4 text-[13px] leading-relaxed text-mute sm:text-sm">{member.bio}</p>

      <HudCorners className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" inset={5} />
    </article>
  );
}

/** Branded stand-in for members whose photo hasn't been added yet. */
function PhotoPlaceholder() {
  return (
    <div className="relative grid size-full place-items-center bg-carbon">
      <div aria-hidden="true" className="absolute inset-0 bg-grid-fine opacity-70" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,208,0,0.18),transparent_62%)]"
      />
      <div className="relative -mt-8 flex flex-col items-center gap-3">
        <SpiritFlame className="w-20 opacity-90 drop-shadow-[0_0_18px_rgba(255,208,0,0.45)] sm:w-24" />
        <span className="font-mono text-[9.5px] tracking-[0.22em] text-white/55 uppercase">Photo incoming</span>
      </div>
    </div>
  );
}
