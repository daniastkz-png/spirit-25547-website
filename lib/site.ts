/**
 * Site content & configuration.
 *
 * Nearly everything a team member needs to edit lives in this file: copy, stats,
 * team roster, awards and links. Items marked `TODO` are placeholders that
 * should be replaced before launch.
 */

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const site = {
  name: "SPIRIT",
  teamNumber: "25547",
  title: "SPIRIT | FTC Robotics Team #25547",
  description:
    "SPIRIT is a FIRST Tech Challenge robotics team (#25547) from Astana, Kazakhstan — engineering the future of autonomous robotics through precision CAD, agile programming and relentless passion.",
  url: siteUrl.replace(/\/$/, ""),
  rookieYear: 2023,
  homeBase: "Al-Farabi Palace of Schoolchildren",
  homeBaseImage: "/base/al-farabi-palace.webp",
  location: {
    city: "Astana",
    country: "Kazakhstan",
    short: "ASTANA, KZ",
    coordinates: "51.17°N 71.45°E",
  },
  // TODO: set once the team has an inbox. While null, sponsor buttons open LinkedIn instead.
  email: null as string | null,
  portfolio: {
    href: "/portfolio/spirit-25547-engineering-portfolio.pdf",
    fileName: "SPIRIT-25547-Engineering-Portfolio.pdf",
  },
} as const;

export type SocialId = "instagram" | "youtube" | "linkedin" | "github" | "ftcscout" | "first";

export const socials: { id: SocialId; label: string; handle: string; href: string }[] = [
  { id: "instagram", label: "Instagram", handle: "SPIRIT 25547", href: "https://www.instagram.com/p/DbSs7o5MvPs" },
  { id: "youtube", label: "YouTube", handle: "@spirit25547", href: "https://www.youtube.com/@spirit25547" },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "spirit-ftc",
    href: "https://www.linkedin.com/company/spirit-ftc",
  },
  {
    id: "github",
    label: "GitHub",
    handle: "spirit-25547-website",
    href: "https://github.com/daniastkz-png/spirit-25547-website",
  },
  { id: "ftcscout", label: "FTC Scout", handle: "Team 25547", href: "https://ftcscout.org/teams/25547" },
  { id: "first", label: "FIRST Events", handle: "Team 25547", href: "https://ftc-events.firstinspires.org/team/25547" },
];

// Top menu. Sponsors is reached through the yellow "Sponsor us" button instead.
export const navLinks = [
  { label: "Team", href: "#team" },
  { label: "Robot", href: "#robot" },
  { label: "Awards", href: "#awards" },
  { label: "Outreach", href: "#outreach" },
  { label: "Portfolio", href: "#portfolio" },
] as const;

// The footer has no "Sponsor us" button, so it keeps a Sponsors link.
export const footerLinks = [...navLinks, { label: "Sponsors", href: "#sponsors" }] as const;

/* ───────────────────────────── Hero ───────────────────────────── */

export const heroBadges = [
  { id: "sizing", label: "18x18x18 COMPLIANT" },
  { id: "auto", label: "AUTO ACCURACY: 98.4%" },
  { id: "vision", label: "APRILTAG VISION LOCK" },
] as const;

/* ───────────────────────────── Robot subsystems ───────────────────────────── */

export type SubsystemId = "drivetrain" | "vision" | "scoring" | "frame";

export type Subsystem = {
  id: SubsystemId;
  code: string;
  name: string;
  headline: string;
  description: string;
  specs: [label: string, value: string][];
  tags: string[];
};

// TODO: swap the spec values for your current robot's real numbers.
export const subsystems: Subsystem[] = [
  {
    id: "drivetrain",
    code: "SYS-01",
    name: "Drivetrain",
    headline: "High-torque Mecanum drive with odometry pods & gyro PID stabilization.",
    description:
      "Four independently driven mecanum wheels give us true holonomic control: strafe, rotate and translate at the same time. Dead-wheel odometry pods and the IMU fuse into a field-relative pose, and a PID heading lock keeps the chassis on line under contact.",
    specs: [
      ["Configuration", "4× mecanum, holonomic"],
      ["Localization", "3-wheel odometry + IMU"],
      ["Control", "Field-centric, PID heading lock"],
      ["Wheels", "104 mm mecanum"],
    ],
    tags: ["Holonomic", "Odometry", "PID"],
  },
  {
    id: "vision",
    code: "SYS-02",
    name: "Vision & Autonomous",
    headline: "OpenCV / AprilTag pipeline running on the REV Control Hub.",
    description:
      "A forward camera streams straight into an on-robot vision pipeline: AprilTags for instant field relocalization, OpenCV color thresholds for game-element detection. Fused poses feed spline-based paths that run the full 30-second autonomous period.",
    specs: [
      ["Compute", "REV Control Hub"],
      ["Pipeline", "AprilTag + OpenCV"],
      ["Target lock", "0.15 s"],
      ["Paths", "Spline following, pose fusion"],
    ],
    tags: ["AprilTag", "OpenCV", "Java"],
  },
  {
    id: "scoring",
    code: "SYS-03",
    name: "Scoring & Manipulator",
    headline: "Custom multi-stage linear slide assembly with compliant intake claw.",
    description:
      "Three-stage linear slides lift the claw to scoring height in a single sweep. Compliant TPU fingers forgive misalignment on intake and keep a locked grip on game elements through heavy defense.",
    specs: [
      ["Lift", "3-stage linear slides"],
      ["Actuation", "Dual motor, PIDF hold"],
      ["End effector", "Servo claw, TPU fingers"],
      ["Mounting", "Rear tower, carbon gussets"],
    ],
    tags: ["Linear Slides", "PIDF", "TPU"],
  },
  {
    id: "frame",
    code: "SYS-04",
    name: "Sizing & Frame",
    headline: "Ultra-rigid CNC aluminum & carbon fiber within strict 18-inch sizing constraints.",
    description:
      "Every subsystem packs inside the 18 × 18 × 18 in starting envelope. CNC aluminum rails carry the load, carbon fiber plates shave weight, and the whole layout is proven in CAD before a single bolt is turned.",
    specs: [
      ["Envelope", "18 × 18 × 18 in"],
      ["Rails", "CNC aluminum channel"],
      ["Plates", "Carbon fiber"],
      ["Design", "Full-robot CAD assembly"],
    ],
    tags: ["CAD", "CNC", "Carbon Fiber"],
  },
];

/* ───────────────────────────── Team ───────────────────────────── */

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  /** 4:5 portrait in /public/team. Members without one get a branded placeholder. */
  photo?: string;
  captain?: boolean;
};

export const team: TeamMember[] = [
  {
    name: "Diar",
    role: "Captain",
    bio: "Leads the team on and off the field and keeps everyone pulling the same way.",
    photo: "/team/diar.webp",
    captain: true,
  },
  {
    name: "Darina",
    role: "Inspire",
    bio: "Leads our Inspire Award push: the engineering portfolio, judging interviews and outreach.",
    photo: "/team/darina.webp",
  },
  {
    name: "Khamza",
    role: "Main Builder",
    bio: "Heads the build, turning CAD into a competition-ready robot.",
    photo: "/team/khamza.webp",
  },
  {
    name: "Bekzhan",
    role: "Builder",
    bio: "Assembles, tunes and repairs mechanisms from the drivetrain up.",
    photo: "/team/bekzhan.webp",
  },
  {
    name: "Nurassyl",
    role: "Coder",
    bio: "Programs driver control, autonomous routines and vision.",
    photo: "/team/nurassyl.webp",
  },
  {
    name: "Danial",
    role: "Coder",
    bio: "Writes robot code, from autonomous paths to the control loops that keep it precise.",
    photo: "/team/danial.webp",
  },
];

/* ───────────────────────────── Outreach & portfolio ───────────────────────────── */

/* ───────────────────────────── Awards ───────────────────────────── */

export type Award = {
  name: string;
  placement: "Winner" | "2nd Place" | "3rd Place";
  event: string;
  year?: string;
  /** Straightened certificate scan in /public/awards (1400 × 990, √2 landscape). */
  image: string;
  /** Larger 2400 × 1697 version opened by the full-size view. */
  fullImage: string;
};

// Newest first.
export const awards: Award[] = [
  {
    name: "Inspire Award",
    placement: "2nd Place",
    event: "Bilim Shyny FIRST Off-Season",
    year: "2026",
    image: "/awards/inspire-2nd-bilim-shyny-2026.webp",
    fullImage: "/awards/inspire-2nd-bilim-shyny-2026-full.webp",
  },
  {
    name: "Reach Award",
    placement: "Winner",
    event: "Burabay FIRST Regional",
    year: "2025",
    image: "/awards/reach-winner-burabay-2025.webp",
    fullImage: "/awards/reach-winner-burabay-2025-full.webp",
  },
  {
    name: "Reach Award",
    placement: "2nd Place",
    event: "Astana FIRST Regional",
    year: "2025",
    image: "/awards/reach-2nd-astana-2025.webp",
    fullImage: "/awards/reach-2nd-astana-2025-full.webp",
  },
  {
    name: "Inspire Award",
    placement: "2nd Place",
    event: "Ontustik FIRST Championship",
    year: "2025",
    image: "/awards/inspire-2nd-ontustik.webp",
    fullImage: "/awards/inspire-2nd-ontustik-full.webp",
  },
];

export type OutreachId = "workshops" | "mentorship" | "opensource";

export const outreach: { id: OutreachId; tag: string; title: string; body: string; points: string[] }[] = [
  {
    id: "workshops",
    tag: "COMMUNITY",
    title: "STEM Workshops",
    body: "Hands-on robotics sessions at schools, libraries and community events. Kids drive real robots, wire their first motors and write their first lines of code.",
    points: ["Live robot demos", "Intro to coding", "Build challenges"],
  },
  {
    id: "mentorship",
    tag: "MENTORSHIP",
    title: "Mentoring Younger Teams",
    body: "We coach FIRST LEGO League and rookie FTC teams through design reviews, programming help and scrimmage practice.",
    points: ["FLL coaching", "Rookie FTC support", "Practice scrimmages"],
  },
  {
    id: "opensource",
    tag: "OPEN SOURCE",
    title: "Open-Source CAD & Code",
    body: "Our CAD models, robot code and build notes are published so any team can learn from what we build, and improve on it.",
    points: ["Public CAD releases", "Robot code on GitHub", "Build guides"],
  },
];

export const portfolioChapters = [
  "Team, mission & season goals",
  "Engineering design process",
  "Robot subsystems & CAD",
  "Software, vision & autonomous",
  "Outreach, business & sustainability",
] as const;

/* ───────────────────────────── Sponsors ───────────────────────────── */

export const sponsorPerks = [
  "Logo on the competition robot & pit display",
  "Recognition at events, in our portfolio and online",
  "Direct impact on Kazakhstan's next engineers",
] as const;
