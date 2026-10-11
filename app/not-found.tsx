import type { Metadata } from "next";
import { SpiritFlame } from "@/components/brand/spirit-flame";
import { ButtonLink } from "@/components/ui/button";
import { HudCorners, MonoTag } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Signal lost",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="relative grid min-h-[100dvh] place-items-center overflow-hidden px-4 py-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />
      <div aria-hidden="true" className="absolute inset-0 scanlines opacity-50" />
      <div className="relative w-full max-w-xl border border-white/10 bg-ink/80 p-8 text-center sm:p-12">
        <HudCorners className="-m-2" />
        <SpiritFlame id="not-found" className="mx-auto w-16 drop-shadow-[0_0_24px_rgba(255,200,0,0.6)]" />
        <MonoTag className="mt-8">Error 404 {"//"} Signal lost</MonoTag>
        <h1 className="mt-4 font-display-xc text-7xl leading-none font-black text-white uppercase text-shadow-glow sm:text-8xl">
          Off the field
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-mute">
          This page drove out of bounds. Head back to base and we&apos;ll get you lined up again.
        </p>
        <ButtonLink href="/" className="mt-9">
          Return to base
        </ButtonLink>
      </div>
    </main>
  );
}
