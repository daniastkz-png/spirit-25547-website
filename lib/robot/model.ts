/**
 * Low-poly 3D model of the SPIRIT competition robot.
 *
 * Units are inches. Axes: +x = robot right, +y = up, +z = robot front.
 * Every part is an axis-aligned box, an extruded convex profile or a cylinder,
 * and parts never interpenetrate. That keeps depth sorting exact from any angle.
 * The whole robot fits inside the 18 × 18 × 18 in FTC starting envelope.
 */

export type Vec3 = readonly [number, number, number];
export type Axis = 0 | 1 | 2;
export type FaceId = "+x" | "-x" | "+y" | "-y" | "+z" | "-z";
export type Subsystem = "drivetrain" | "vision" | "scoring" | "frame";
export type MaterialId = "alu" | "carbon" | "volt" | "rubber" | "hub" | "lens" | "led";

export type FaceDecor = {
  face: FaceId;
  /** Rows of evenly spaced through-holes along the face's long axis. */
  holes?: { pitch: number; radius: number; rows: number; rowGap?: number; margin?: number };
  label?: { text: string; size: number; fill: string; weight?: number; tracking?: number };
};

type PartBase = {
  id: string;
  sys: Subsystem;
  mat: MaterialId;
  /** Hidden inside the robot when shaded; only drawn by the blueprint viewer. */
  wireOnly?: boolean;
};

export type BoxPart = PartBase & { kind: "box"; min: Vec3; max: Vec3; decor?: FaceDecor[] };

/** Convex 2D profile extruded along an axis. Profile is in (a, b) = the two other axes, see `profileToWorld`. */
export type PrismPart = PartBase & {
  kind: "prism";
  axis: Axis;
  span: readonly [number, number];
  profile: readonly (readonly [number, number])[];
};

export type CylinderStyle = "mecanum-a" | "mecanum-b" | "plain" | "lens" | "omni";

export type CylinderPart = PartBase & {
  kind: "cyl";
  axis: Axis;
  center: Vec3;
  radius: number;
  length: number;
  style: CylinderStyle;
  /** Rotates with the drive animation. */
  spins?: boolean;
};

export type Part = BoxPart | PrismPart | CylinderPart;

/** Profile coordinates (a, b) for each extrusion axis: x → (z, y), y → (x, z), z → (x, y). */
export function profileToWorld(axis: Axis, t: number, a: number, b: number): Vec3 {
  if (axis === 0) return [t, b, a];
  if (axis === 1) return [a, t, b];
  return [a, b, t];
}

const flipFace = (f: FaceId): FaceId => (f === "+x" ? "-x" : f === "-x" ? "+x" : f);

/** Mirror a box across the robot's centerline (x = 0). */
function mirror(part: BoxPart, id: string): BoxPart {
  return {
    ...part,
    id,
    min: [-part.max[0], part.min[1], part.min[2]],
    max: [-part.min[0], part.max[1], part.max[2]],
    decor: part.decor?.map((d) => ({ ...d, face: flipFace(d.face) })),
  };
}

const box = (
  id: string,
  sys: Subsystem,
  mat: MaterialId,
  min: Vec3,
  max: Vec3,
  extra: Partial<BoxPart> = {},
): BoxPart => ({ kind: "box", id, sys, mat, min, max, ...extra });

/* ───────────────────────────── Frame ───────────────────────────── */

const railHoles: FaceDecor["holes"] = { pitch: 0.94, radius: 0.12, rows: 2, rowGap: 0.95, margin: 0.5 };

const railR = box("rail-r", "frame", "alu", [5.2, 1.2, -8.4], [7.1, 3.1, 8.4], {
  decor: [
    { face: "+x", holes: railHoles },
    { face: "+y", holes: { pitch: 0.94, radius: 0.12, rows: 1, margin: 0.5 } },
  ],
});

const teamPlateR = box("plate-r", "frame", "volt", [7.1, 1.45, -3.3], [7.18, 2.85, 3.3], {
  decor: [{ face: "+x", label: { text: "25547", size: 1.08, fill: "#0a0a0a", weight: 900, tracking: 0.06 } }],
});

const gussetProfile = [
  [-8.2, 3.28],
  [-4.3, 3.28],
  [-6.9, 10.2],
  [-8.2, 10.2],
] as const;

const frame: Part[] = [
  railR,
  mirror(railR, "rail-l"),
  box("cross-front", "frame", "alu", [-5.2, 1.2, 6.5], [5.2, 3.1, 8.4], {
    decor: [{ face: "+z", label: { text: "SPIRIT", size: 1.5, fill: "#ffe600", weight: 900, tracking: 0.16 } }],
  }),
  box("cross-back", "frame", "alu", [-5.2, 1.2, -8.4], [5.2, 3.1, -6.5], {
    decor: [{ face: "-z", holes: railHoles }],
  }),
  box("belly-pan", "frame", "carbon", [-5.2, 1.0, -6.5], [5.2, 1.2, 6.5]),
  box("deck-front", "frame", "carbon", [-7.1, 3.1, 2.8], [7.1, 3.28, 8.4], {
    decor: [{ face: "+y", holes: { pitch: 1.55, radius: 0.36, rows: 2, rowGap: 2.6, margin: 1.2 } }],
  }),
  box("deck-rear", "frame", "carbon", [-7.1, 3.1, -8.4], [7.1, 3.28, -2.4], {
    decor: [{ face: "+y", holes: { pitch: 1.55, radius: 0.3, rows: 1, margin: 1.4 } }],
  }),
  teamPlateR,
  mirror(teamPlateR, "plate-l"),
  { kind: "prism", id: "gusset-r", sys: "frame", mat: "carbon", axis: 0, span: [4.0, 4.2], profile: gussetProfile },
  { kind: "prism", id: "gusset-l", sys: "frame", mat: "carbon", axis: 0, span: [-4.2, -4.0], profile: gussetProfile },
  box("battery", "frame", "hub", [0.6, 1.2, -2.2], [4.6, 2.6, 2.4], {
    decor: [{ face: "+y", label: { text: "12V", size: 0.9, fill: "#ffd000", weight: 800, tracking: 0.1 } }],
  }),
];

/* ───────────────────────────── Drivetrain ───────────────────────────── */

const wheel = (id: string, x: number, z: number, style: CylinderStyle): CylinderPart => ({
  kind: "cyl",
  id,
  sys: "drivetrain",
  mat: "rubber",
  axis: 0,
  center: [x, 2.05, z],
  radius: 2.05,
  length: 1.5,
  style,
  spins: true,
});

const motor = (id: string, side: 1 | -1, z: number): Part[] => [
  {
    kind: "cyl",
    id: `${id}-can`,
    sys: "drivetrain",
    mat: "hub",
    axis: 0,
    center: [side * 3.4, 2.05, z],
    radius: 0.72,
    length: 2.4,
    style: "plain",
    wireOnly: true,
  },
  box(
    `${id}-gearbox`,
    "drivetrain",
    "volt",
    side > 0 ? [4.6, 1.3, z - 0.75] : [-5.2, 1.3, z - 0.75],
    side > 0 ? [5.2, 2.8, z + 0.75] : [-4.6, 2.8, z + 0.75],
    { wireOnly: true },
  ),
];

const pod = (id: string, axis: Axis, center: Vec3): CylinderPart => ({
  kind: "cyl",
  id,
  sys: "drivetrain",
  mat: "volt",
  axis,
  center,
  radius: 0.47,
  length: 0.45,
  style: "omni",
  wireOnly: true,
});

const drivetrain: Part[] = [
  wheel("wheel-fl", -8.0, 5.6, "mecanum-a"),
  wheel("wheel-fr", 8.0, 5.6, "mecanum-b"),
  wheel("wheel-bl", -8.0, -5.6, "mecanum-b"),
  wheel("wheel-br", 8.0, -5.6, "mecanum-a"),
  ...motor("motor-fl", -1, 5.6),
  ...motor("motor-fr", 1, 5.6),
  ...motor("motor-bl", -1, -5.6),
  ...motor("motor-br", 1, -5.6),
  pod("odo-left", 0, [-2.8, 0.47, -1.0]),
  pod("odo-right", 0, [2.8, 0.47, -1.0]),
  pod("odo-strafe", 2, [0, 0.47, -4.5]),
];

/* ───────────────────────────── Vision & electronics ───────────────────────────── */

const vision: Part[] = [
  box("control-hub", "vision", "hub", [-4.7, 1.2, -2.2], [-0.6, 2.45, 2.6]),
  box("hub-led", "vision", "led", [-1.5, 2.45, 1.7], [-1.0, 2.55, 2.2]),
  box("cam-post", "vision", "alu", [-0.3, 3.28, 6.9], [0.3, 4.4, 7.5]),
  box("cam-body", "vision", "hub", [-1.4, 4.4, 6.6], [1.4, 5.5, 7.6]),
  {
    kind: "cyl",
    id: "cam-lens",
    sys: "vision",
    mat: "lens",
    axis: 2,
    center: [0, 4.95, 7.85],
    radius: 0.42,
    length: 0.5,
    style: "lens",
  },
];

/* ───────────────────────────── Scoring ───────────────────────────── */

const stage1 = box("slide-1-r", "scoring", "alu", [3.0, 3.28, -7.6], [4.0, 15.9, -6.7]);
const stage2 = box("slide-2-r", "scoring", "volt", [3.1, 3.8, -6.7], [3.9, 16.6, -6.0]);
const stage3 = box("slide-3-r", "scoring", "alu", [3.2, 4.4, -6.0], [3.8, 17.3, -5.4]);
const finger = box("finger-r", "scoring", "volt", [1.1, 12.3, 1.0], [1.7, 14.6, 1.7]);
const pad = box("pad-r", "scoring", "rubber", [0.9, 12.3, 1.05], [1.1, 13.5, 1.65]);

const scoring: Part[] = [
  stage1,
  mirror(stage1, "slide-1-l"),
  stage2,
  mirror(stage2, "slide-2-l"),
  stage3,
  mirror(stage3, "slide-3-l"),
  box("carriage", "scoring", "volt", [-3.2, 15.9, -6.0], [3.2, 16.7, -5.4]),
  box("arm", "scoring", "carbon", [-0.5, 15.95, -5.4], [0.5, 16.65, 0.8]),
  box("wrist", "scoring", "volt", [-1.0, 15.2, 0.8], [1.0, 16.9, 1.9]),
  box("palm", "scoring", "alu", [-1.7, 14.6, 0.85], [1.7, 15.2, 1.85]),
  finger,
  mirror(finger, "finger-l"),
  pad,
  mirror(pad, "pad-l"),
];

export const robotParts: Part[] = [...frame, ...drivetrain, ...vision, ...scoring];

/** Point the camera orbits around (roughly the robot's center of mass). */
export const robotCenter: Vec3 = [0, 7.6, 0];

/** FTC starting-configuration sizing envelope, centered on the robot footprint. */
export const sizingEnvelope = { min: [-9, 0, -9] as Vec3, max: [9, 18, 9] as Vec3 };

/** Anchor points for blueprint callouts, per subsystem. */
export const callouts: Record<Subsystem, { id: string; label: string; sub: string; at: Vec3 }[]> = {
  drivetrain: [
    { id: "mecanum", label: "MECANUM ×4", sub: "HOLONOMIC DRIVE", at: [8.75, 2.05, 5.6] },
    { id: "odometry", label: "ODOMETRY PODS ×3", sub: "DEAD-WHEEL LOCALIZATION", at: [2.8, 0.47, -1.0] },
    { id: "motors", label: "DRIVE MOTORS ×4", sub: "PID HEADING LOCK", at: [-4.9, 2.05, -5.6] },
  ],
  vision: [
    { id: "camera", label: "CAM_01", sub: "APRILTAG + OPENCV", at: [0, 4.95, 8.1] },
    { id: "hub", label: "REV CONTROL HUB", sub: "ON-ROBOT PIPELINE", at: [-2.65, 2.45, 0.2] },
  ],
  scoring: [
    { id: "slides", label: "3-STAGE SLIDES", sub: "DUAL MOTOR · PIDF", at: [3.5, 12.5, -6.35] },
    { id: "claw", label: "COMPLIANT CLAW", sub: "TPU FINGERS", at: [0, 13.2, 1.35] },
  ],
  frame: [
    { id: "envelope", label: "18.00 IN ENVELOPE", sub: "STARTING CONFIG", at: [9, 18, 9] },
    { id: "rails", label: "CNC ALU RAILS", sub: "LOAD PATH", at: [7.1, 2.15, -0.2] },
    { id: "plates", label: "CARBON FIBER", sub: "DECK + GUSSETS", at: [4.2, 7.4, -6.6] },
  ],
};
