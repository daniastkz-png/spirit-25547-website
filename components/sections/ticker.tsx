import { site } from "@/lib/site";

const items = [
  "SPIRIT",
  `FTC TEAM #${site.teamNumber}`,
  "UNLEASH THE DRIVE",
  "BIOBUZZ SEASON",
  "STUDENT-BUILT",
  "PRECISION CAD",
  "AGILE CODE",
];

/** Full-bleed scrolling ticker band. Static for reduced-motion users. */
export function Ticker() {
  const row = (
    <ul className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item} className="flex items-center">
          <span className="px-6 font-display text-2xl font-black tracking-[0.08em] uppercase sm:text-3xl">{item}</span>
          <span aria-hidden="true" className="size-2.5 rotate-45 bg-ink" />
        </li>
      ))}
    </ul>
  );

  return (
    <div aria-hidden="true" className="relative -my-px overflow-hidden border-y-2 border-ink bg-volt py-3 text-ink">
      <div className="flex w-max motion-safe:animate-marquee">
        {row}
        {row}
      </div>
    </div>
  );
}
