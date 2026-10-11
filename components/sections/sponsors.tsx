import { ArrowRight, Check, FileDown, Mail } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container, MonoTag, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { LinkedinIcon } from "@/components/brand/social-icons";
import { site, socials, sponsorPerks } from "@/lib/site";

const linkedin = socials.find((s) => s.id === "linkedin")?.href ?? "#";

// Email when the team has an inbox, otherwise the LinkedIn page.
const contact = site.email
  ? {
      href: `mailto:${site.email}?subject=${encodeURIComponent(`Sponsoring FTC Team #${site.teamNumber} SPIRIT`)}`,
      external: false,
    }
  : { href: linkedin, external: true };

export function Sponsors() {
  return (
    <section id="sponsors" className="relative overflow-hidden border-t border-white/10 bg-carbon py-24 lg:py-32">
      <div aria-hidden="true" className="absolute inset-0 bg-dots opacity-30" />
      <div
        aria-hidden="true"
        className="absolute bottom-0 -left-40 size-[40rem] bg-[radial-gradient(circle,rgba(255,170,0,0.08),transparent_65%)]"
      />

      <Container className="relative">
        <Reveal>
          <SectionHeader
            index="06"
            kicker="Sponsors & Partners"
            title={
              <>
                Fueling team <span className="text-volt">Spirit</span>
              </>
            }
            description="Every part on our robot and every workshop we run is made possible by partners who believe in student engineers. Thank you."
          />
        </Reveal>

        <Reveal className="mt-14">
          <SponsorCta />
        </Reveal>
      </Container>
    </section>
  );
}

function SponsorCta() {
  return (
    <div className="relative overflow-hidden border border-volt/50 bg-ink">
      <div aria-hidden="true" className="h-2.5 bg-hazard opacity-90" />
      <div
        aria-hidden="true"
        className="absolute inset-0 top-2.5 bg-[radial-gradient(ellipse_at_85%_50%,rgba(255,230,0,0.16),transparent_60%)]"
      />
      <div aria-hidden="true" className="absolute inset-0 top-2.5 bg-grid opacity-40" />

      <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:p-14">
        <div>
          <MonoTag>Sponsorship {"//"} Open for 2026–27</MonoTag>
          <h3 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.75rem)] leading-[0.92] font-extrabold tracking-tight text-white uppercase">
            Interested in backing Team #{site.teamNumber}? <span className="text-volt">Let&apos;s connect.</span>
          </h3>
          <ul className="mt-7 space-y-2.5">
            {sponsorPerks.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-white/85">
                <Check className="mt-0.5 size-5 shrink-0 text-volt" aria-hidden="true" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          <ButtonLink
            href={contact.href}
            {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="w-full lg:w-auto"
          >
            {contact.external ? <LinkedinIcon className="size-5" /> : <Mail className="size-5" aria-hidden="true" />}
            Become a sponsor
            <ArrowRight
              className="size-5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </ButtonLink>
          <ButtonLink
            href={site.portfolio.href}
            download={site.portfolio.fileName}
            variant="ghost"
            className="w-full lg:w-auto"
          >
            <FileDown className="size-5 text-volt" aria-hidden="true" />
            Download portfolio
          </ButtonLink>
          <p className="font-mono text-[10px] tracking-[0.2em] text-mute uppercase lg:text-right">
            {site.email ? (
              <>
                Or email{" "}
                <a
                  href={contact.href}
                  className="text-white underline decoration-volt/50 underline-offset-4 hover:text-volt"
                >
                  {site.email}
                </a>
              </>
            ) : (
              "Message us on LinkedIn"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
