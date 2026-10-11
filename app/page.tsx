import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { Awards } from "@/components/sections/awards";
import { Outreach } from "@/components/sections/outreach";
import { Portfolio } from "@/components/sections/portfolio";
import { RobotSpecs } from "@/components/sections/robot-specs";
import { Sponsors } from "@/components/sections/sponsors";
import { Team } from "@/components/sections/team";
import { Ticker } from "@/components/sections/ticker";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Team />
        <RobotSpecs />
        <Awards />
        <Ticker />
        <Outreach />
        <Portfolio />
        <Sponsors />
      </main>
      <Footer />
    </>
  );
}
