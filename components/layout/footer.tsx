import { ArrowUp, ArrowUpRight, MapPin } from "lucide-react";
import { SpiritMark } from "@/components/brand/spirit-flame";
import { socialIcons } from "@/components/brand/social-icons";
import { Container, MonoTag } from "@/components/ui/primitives";
import { footerLinks, site, socials } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  const community = socials.filter(
    (s) => s.id === "instagram" || s.id === "youtube" || s.id === "linkedin" || s.id === "github",
  );
  const records = socials.filter((s) => s.id === "ftcscout" || s.id === "first");

  return (
    <footer className="relative overflow-hidden border-t border-volt/30 bg-ink">
      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-volt to-transparent shadow-glow" />

      {/* Giant outlined wordmark */}
      <div aria-hidden="true" className="pointer-events-none overflow-hidden select-none">
        <p className="mt-6 -mb-[0.2em] bg-gradient-to-b from-volt/30 via-volt/10 to-transparent bg-clip-text text-center font-display-xc text-[clamp(6rem,24vw,22rem)] leading-none font-black tracking-tight whitespace-nowrap text-transparent uppercase">
          Spirit 25547
        </p>
      </div>

      <Container className="relative border-t border-white/10 pt-14 pb-10">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-5">
            <a href="#top" className="inline-flex items-center gap-3" aria-label="SPIRIT, back to top">
              <SpiritMark id="footer-mark" />
              <span className="font-display text-3xl font-black tracking-[0.06em] text-white uppercase">Spirit</span>
              <span className="font-mono text-xs font-semibold text-volt">[{site.teamNumber}]</span>
            </a>
            <p className="mt-5 max-w-sm leading-relaxed text-mute">
              Student-built FIRST Tech Challenge robotics. Precision CAD, agile code and relentless passion.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-white/70 uppercase">
              <MapPin className="size-3.5 text-volt" aria-hidden="true" />
              {site.location.city}, {site.location.country}
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <MonoTag tone="mute" brackets={false} className="text-[10px]">
              Navigate
            </MonoTag>
            <ul className="mt-5 space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-display font-semibold tracking-wide text-white/75 uppercase transition-colors hover:text-volt"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <MonoTag tone="mute" brackets={false} className="text-[10px]">
              Follow
            </MonoTag>
            <ul className="mt-5 space-y-2.5">
              {community.map((s) => {
                const Icon = socialIcons[s.id];
                return (
                  <li key={s.id}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 font-display font-semibold tracking-wide text-white/75 uppercase transition-colors hover:text-volt"
                    >
                      <span className="grid size-8 place-items-center border border-white/15 transition-colors group-hover:border-volt">
                        <Icon className="size-4" />
                      </span>
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <MonoTag tone="mute" brackets={false} className="text-[10px]">
              Team records
            </MonoTag>
            <ul className="mt-5 space-y-2.5">
              {records.map((s) => {
                const Icon = socialIcons[s.id];
                return (
                  <li key={s.id}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 font-display font-semibold tracking-wide text-white/75 uppercase transition-colors hover:text-volt"
                    >
                      <span className="grid size-8 place-items-center border border-white/15 transition-colors group-hover:border-volt">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      {s.label}
                      <ArrowUpRight
                        className="size-3.5 opacity-50 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
            {site.email && (
              <a
                href={`mailto:${site.email}`}
                className="mt-6 inline-block font-mono text-xs break-all text-white/70 underline decoration-volt/40 underline-offset-4 transition-colors hover:text-volt"
              >
                {site.email}
              </a>
            )}
          </div>
        </div>

        <p className="mt-14 max-w-4xl text-xs leading-relaxed text-white/55">
          FIRST®, FIRST® Tech Challenge, Gracious Professionalism® and Coopertition® are registered trademarks of FIRST®
          (For Inspiration and Recognition of Science and Technology), which is not overseeing, involved with, or
          responsible for this website.
        </p>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] tracking-[0.14em] text-mute uppercase">
            © {year} Team Spirit {site.teamNumber}. Built with <span className="text-volt">FIRST</span> spirit.
          </p>
          <a
            href="#top"
            className="group inline-flex items-center gap-2 self-start font-mono text-[11px] tracking-[0.2em] text-white/70 uppercase transition-colors hover:text-volt sm:self-auto"
          >
            Back to top
            <span className="grid size-8 place-items-center border border-white/15 transition-colors group-hover:border-volt">
              <ArrowUp className="size-4 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
            </span>
          </a>
        </div>
      </Container>
    </footer>
  );
}
