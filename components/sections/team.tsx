import { HomeBaseCard } from "@/components/team/home-base-card";
import { TeamRoster } from "@/components/team/team-roster";
import { Container, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/lib/site";

export function Team() {
  return (
    <section id="team" className="relative overflow-clip border-t border-white/10 py-24 lg:py-32">
      <div aria-hidden="true" className="absolute inset-0 bg-dots opacity-30" />
      <div
        aria-hidden="true"
        className="absolute top-20 -right-40 size-[36rem] bg-[radial-gradient(circle,rgba(255,230,0,0.09),transparent_65%)]"
      />

      <Container className="relative">
        <Reveal>
          <SectionHeader
            index="01"
            kicker="Team"
            title={
              <>
                Meet the <span className="text-volt">Team</span>
              </>
            }
          />
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="space-y-4 text-lg leading-relaxed text-mute">
                <p>
                  SPIRIT (#{site.teamNumber}) is a student-led{" "}
                  <strong className="font-semibold text-white">FIRST Tech Challenge</strong> team from{" "}
                  {site.location.city}, {site.location.country}, based at the {site.homeBase}.
                </p>
                <p>
                  Since {site.rookieYear}, we&apos;ve designed, built and programmed our robots from scratch, earned
                  Inspire and Reach awards, and competed at two Central Asia Championships. Beyond the robot,
                  we use FTC to grow as engineers and give back to our community.
                </p>
              </div>
            </Reveal>

            <div className="mt-12">
              <TeamRoster />
            </div>
          </div>

          {/* Stays in view alongside the roster on wide screens. */}
          <Reveal className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start" delay={0.1}>
            <HomeBaseCard />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
