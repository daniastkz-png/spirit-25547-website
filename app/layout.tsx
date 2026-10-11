import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Saira } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { site, socials } from "@/lib/site";
import "./globals.css";

// One variable family drives both body copy and condensed display type (via the wdth axis).
const saira = Saira({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-saira",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s | SPIRIT #${site.teamNumber}`,
  },
  description: site.description,
  applicationName: "SPIRIT #25547",
  keywords: [
    "SPIRIT",
    "FTC 25547",
    "FIRST Tech Challenge",
    "robotics team",
    "Astana",
    "Kazakhstan",
    "STEM",
    "mecanum",
    "AprilTag",
    "engineering portfolio",
  ],
  authors: [{ name: "Team SPIRIT #25547" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SPIRIT — FTC #25547",
    title: site.title,
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  name: "SPIRIT",
  alternateName: `FTC Team #${site.teamNumber}`,
  sport: "Robotics",
  url: site.url,
  description: site.description,
  foundingDate: String(site.rookieYear),
  location: {
    "@type": "Place",
    address: { "@type": "PostalAddress", addressLocality: site.location.city, addressCountry: "KZ" },
  },
  memberOf: { "@type": "SportsOrganization", name: "FIRST Tech Challenge", url: "https://www.firstinspires.org" },
  sameAs: socials.filter((s) => s.id !== "github").map((s) => s.href),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${saira.variable} ${jetbrains.variable}`}>
      <body>
        {/* Keep scroll-reveal content visible when JavaScript is unavailable. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
