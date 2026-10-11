/**
 * Tiny orthographic 3D → SVG renderer for the robot model.
 *
 * - `createProjector` builds a camera from yaw/pitch.
 * - `renderShaded` returns depth-sorted, lit draw items for the hero render.
 * - `renderWireframe` returns per-subsystem edge paths for the blueprint viewer.
 *
 * Depth sorting is exact for non-intersecting axis-aligned parts: any axis that
 * separates two parts' bounds also orders them along every view ray.
 */

import {
  profileToWorld,
  type Axis,
  type BoxPart,
  type CylinderPart,
  type FaceDecor,
  type FaceId,
  type MaterialId,
  type Part,
  type PrismPart,
  type Subsystem,
  type Vec3,
} from "./model";

/* ───────────────────────────── Math ───────────────────────────── */

type Mutable3 = [number, number, number];

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const add = (a: Vec3, b: Vec3): Mutable3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, s: number): Mutable3 => [a[0] * s, a[1] * s, a[2] * s];
const normalize = (a: Vec3): Mutable3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const r1 = (n: number) => Math.round(n * 10) / 10;
const r3 = (n: number) => Math.round(n * 1000) / 1000;

export const deg = (d: number) => (d * Math.PI) / 180;

export type View = { yaw: number; pitch: number };

export type Viewport = {
  /** Screen position the orbit target maps to. */
  cx: number;
  cy: number;
  /** Pixels per inch. */
  scale: number;
  target: Vec3;
};

export type Projector = {
  /** Unit vector pointing from the scene toward the camera. */
  toCamera: Vec3;
  pxPerInch: number;
  point(p: Vec3): [number, number];
  depth(p: Vec3): number;
  /** Projects a direction (no translation). */
  vec(d: Vec3): [number, number];
  /** SVG matrix() mapping local 2D coords (a, b) to screen via origin + a·U + b·V. */
  matrix(origin: Vec3, U: Vec3, V: Vec3): string;
};

export function createProjector(view: View, vp: Viewport): Projector {
  const cyaw = Math.cos(view.yaw);
  const syaw = Math.sin(view.yaw);
  const cp = Math.cos(view.pitch);
  const sp = Math.sin(view.pitch);
  const c: Vec3 = [syaw * cp, sp, cyaw * cp];
  const r: Vec3 = [cyaw, 0, -syaw];
  const u: Vec3 = [-sp * syaw, cp, -sp * cyaw];
  const [tx, ty, tz] = vp.target;
  const k = vp.scale;

  const vec = (d: Vec3): [number, number] => [k * dot(d, r), -k * dot(d, u)];
  const point = (p: Vec3): [number, number] => {
    const d: Vec3 = [p[0] - tx, p[1] - ty, p[2] - tz];
    return [vp.cx + k * dot(d, r), vp.cy - k * dot(d, u)];
  };

  return {
    toCamera: c,
    pxPerInch: k,
    point,
    depth: (p) => dot([p[0] - tx, p[1] - ty, p[2] - tz], c),
    vec,
    matrix(origin, U, V) {
      const [e, f] = point(origin);
      const [a, b] = vec(U);
      const [cc, d] = vec(V);
      return `matrix(${r3(a)} ${r3(b)} ${r3(cc)} ${r3(d)} ${r1(e)} ${r1(f)})`;
    },
  };
}

const toPath = (pts: readonly (readonly [number, number])[], close = true) => {
  let d = "";
  for (let i = 0; i < pts.length; i++) d += `${i ? "L" : "M"}${r1(pts[i][0])} ${r1(pts[i][1])}`;
  return close ? `${d}Z` : d;
};

/* ───────────────────────────── Materials & light ───────────────────────────── */

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

const MATERIALS: Record<MaterialId, { lit: RGB; dark: RGB; stroke: string }> = {
  alu: { lit: hex("#62676f"), dark: hex("#141619"), stroke: "rgba(255,255,255,0.13)" },
  carbon: { lit: hex("#3a3a40"), dark: hex("#0b0b0c"), stroke: "rgba(255,255,255,0.1)" },
  volt: { lit: hex("#fff27a"), dark: hex("#b36a00"), stroke: "rgba(70,35,0,0.55)" },
  rubber: { lit: hex("#555555"), dark: hex("#0c0c0c"), stroke: "rgba(0,0,0,0.6)" },
  hub: { lit: hex("#454952"), dark: hex("#0f1012"), stroke: "rgba(255,255,255,0.1)" },
  lens: { lit: hex("#2b3644"), dark: hex("#05070a"), stroke: "rgba(255,230,0,0.45)" },
  led: { lit: hex("#fffce0"), dark: hex("#ffd000"), stroke: "rgba(255,230,0,0.9)" },
};

const LIGHT = normalize([-0.42, 0.84, 0.48]);

function shade(mat: MaterialId, n: Vec3, toCamera: Vec3) {
  const m = MATERIALS[mat];
  const diffuse = Math.max(0, dot(n, LIGHT));
  const facing = Math.max(0, dot(n, toCamera));
  const t = Math.min(1, 0.14 + 0.7 * diffuse + 0.16 * facing);
  return `rgb(${Math.round(m.dark[0] + (m.lit[0] - m.dark[0]) * t)} ${Math.round(
    m.dark[1] + (m.lit[1] - m.dark[1]) * t,
  )} ${Math.round(m.dark[2] + (m.lit[2] - m.dark[2]) * t)})`;
}

/* ───────────────────────────── Geometry helpers ───────────────────────────── */

type Face = {
  id: FaceId;
  normal: Vec3;
  center: Vec3;
  /** Local right / down vectors when the face is viewed from outside. */
  U: Vec3;
  V: Vec3;
  hu: number;
  hv: number;
};

function boxFaces(b: BoxPart): Face[] {
  const [x0, y0, z0] = b.min;
  const [x1, y1, z1] = b.max;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const cz = (z0 + z1) / 2;
  const hx = (x1 - x0) / 2;
  const hy = (y1 - y0) / 2;
  const hz = (z1 - z0) / 2;
  return [
    { id: "+x", normal: [1, 0, 0], center: [x1, cy, cz], U: [0, 0, -1], V: [0, -1, 0], hu: hz, hv: hy },
    { id: "-x", normal: [-1, 0, 0], center: [x0, cy, cz], U: [0, 0, 1], V: [0, -1, 0], hu: hz, hv: hy },
    { id: "+y", normal: [0, 1, 0], center: [cx, y1, cz], U: [1, 0, 0], V: [0, 0, 1], hu: hx, hv: hz },
    { id: "-y", normal: [0, -1, 0], center: [cx, y0, cz], U: [1, 0, 0], V: [0, 0, -1], hu: hx, hv: hz },
    { id: "+z", normal: [0, 0, 1], center: [cx, cy, z1], U: [1, 0, 0], V: [0, -1, 0], hu: hx, hv: hy },
    { id: "-z", normal: [0, 0, -1], center: [cx, cy, z0], U: [-1, 0, 0], V: [0, -1, 0], hu: hx, hv: hy },
  ];
}

const faceCorners = (f: Face): Vec3[] => {
  const u = scale(f.U, f.hu);
  const v = scale(f.V, f.hv);
  return [
    add(add(f.center, scale(u, -1)), scale(v, -1)),
    add(add(f.center, u), scale(v, -1)),
    add(add(f.center, u), v),
    add(add(f.center, scale(u, -1)), v),
  ];
};

const boxCorners = (min: Vec3, max: Vec3): Vec3[] => {
  const out: Vec3[] = [];
  for (const x of [min[0], max[0]])
    for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) out.push([x, y, z]);
  return out;
};

const unitAxis = (axis: Axis): Vec3 => (axis === 0 ? [1, 0, 0] : axis === 1 ? [0, 1, 0] : [0, 0, 1]);

/** Two unit vectors spanning the plane perpendicular to `axis`. */
const ringBasis = (axis: Axis): [Vec3, Vec3] =>
  axis === 0
    ? [
        [0, 0, 1],
        [0, 1, 0],
      ]
    : axis === 1
      ? [
          [1, 0, 0],
          [0, 0, 1],
        ]
      : [
          [1, 0, 0],
          [0, 1, 0],
        ];

const ringPoint = (center: Vec3, e1: Vec3, e2: Vec3, radius: number, theta: number): Vec3 =>
  add(center, add(scale(e1, radius * Math.cos(theta)), scale(e2, radius * Math.sin(theta))));

function prismGeometry(p: PrismPart) {
  const [t0, t1] = p.span;
  const n = p.profile.length;
  const back = p.profile.map(([a, b]) => profileToWorld(p.axis, t0, a, b));
  const front = p.profile.map(([a, b]) => profileToWorld(p.axis, t1, a, b));
  const ca = p.profile.reduce((s, q) => s + q[0], 0) / n;
  const cb = p.profile.reduce((s, q) => s + q[1], 0) / n;
  const axisVec = unitAxis(p.axis);
  const faces: { normal: Vec3; pts: Vec3[] }[] = [
    { normal: axisVec, pts: front },
    { normal: scale(axisVec, -1), pts: [...back].reverse() },
  ];
  for (let i = 0; i < n; i++) {
    const [a0, b0] = p.profile[i];
    const [a1, b1] = p.profile[(i + 1) % n];
    let na = b1 - b0;
    let nb = -(a1 - a0);
    if (na * ((a0 + a1) / 2 - ca) + nb * ((b0 + b1) / 2 - cb) < 0) {
      na = -na;
      nb = -nb;
    }
    const l = Math.hypot(na, nb) || 1;
    const normal = profileToWorld(p.axis, 0, na / l, nb / l);
    faces.push({ normal, pts: [back[i], back[(i + 1) % n], front[(i + 1) % n], front[i]] });
  }
  return { back, front, faces };
}

function partBounds(p: Part): { min: Vec3; max: Vec3 } {
  if (p.kind === "box") return { min: p.min, max: p.max };
  if (p.kind === "prism") {
    const pts = p.profile.flatMap(([a, b]) => [
      profileToWorld(p.axis, p.span[0], a, b),
      profileToWorld(p.axis, p.span[1], a, b),
    ]);
    const min: Mutable3 = [Infinity, Infinity, Infinity];
    const max: Mutable3 = [-Infinity, -Infinity, -Infinity];
    for (const q of pts)
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], q[i]);
        max[i] = Math.max(max[i], q[i]);
      }
    return { min, max };
  }
  const half: Mutable3 = [p.radius, p.radius, p.radius];
  half[p.axis] = p.length / 2;
  return {
    min: [p.center[0] - half[0], p.center[1] - half[1], p.center[2] - half[2]],
    max: [p.center[0] + half[0], p.center[1] + half[1], p.center[2] + half[2]],
  };
}

/* ───────────────────────────── Depth sorting ───────────────────────────── */

const EPS = 1e-6;

/** Orders parts back-to-front. Returns indices into `parts`. */
function depthOrder(parts: Part[], proj: Projector): number[] {
  const n = parts.length;
  const bounds = parts.map(partBounds);
  const c = proj.toCamera;
  const axisOrder = ([0, 1, 2] as const).slice().sort((a, b) => Math.abs(c[b]) - Math.abs(c[a]));

  const screen = bounds.map(({ min, max }) => {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const q of boxCorners(min, max)) {
      const [x, y] = proj.point(q);
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
    return { x0, y0, x1, y1 };
  });
  const depth = bounds.map(({ min, max }) =>
    proj.depth([(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2]),
  );

  const after: number[][] = Array.from({ length: n }, () => []);
  const indegree = new Array<number>(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = screen[i];
      const b = screen[j];
      if (a.x1 < b.x0 || b.x1 < a.x0 || a.y1 < b.y0 || b.y1 < a.y0) continue;
      for (const k of axisOrder) {
        if (Math.abs(c[k]) < EPS) continue;
        let first = -1;
        let second = -1;
        if (bounds[i].max[k] <= bounds[j].min[k] + EPS) {
          // j sits on the + side of i along k.
          [first, second] = c[k] > 0 ? [i, j] : [j, i];
        } else if (bounds[j].max[k] <= bounds[i].min[k] + EPS) {
          [first, second] = c[k] > 0 ? [j, i] : [i, j];
        }
        if (first >= 0) {
          after[first].push(second);
          indegree[second]++;
          break;
        }
      }
    }
  }

  // Kahn's algorithm, preferring the farthest part whenever several are ready.
  const order: number[] = [];
  const placed = new Array<boolean>(n).fill(false);
  const ready = new Set<number>();
  for (let i = 0; i < n; i++) if (indegree[i] === 0) ready.add(i);

  while (order.length < n) {
    let pick = -1;
    if (ready.size) {
      for (const i of ready) if (pick < 0 || depth[i] < depth[pick]) pick = i;
      ready.delete(pick);
    } else {
      // Cycle (shouldn't happen for this model): fall back to plain depth order.
      for (let i = 0; i < n; i++) if (!placed[i] && (pick < 0 || depth[i] < depth[pick])) pick = i;
    }
    placed[pick] = true;
    order.push(pick);
    for (const j of after[pick]) if (!placed[j] && --indegree[j] === 0) ready.add(j);
  }
  return order;
}

/* ───────────────────────────── Shaded rendering ───────────────────────────── */

export type LocalShape =
  | { t: "circle"; cx: number; cy: number; r: number; fill?: string; stroke?: string; sw?: number; opacity?: number }
  | { t: "path"; d: string; fill: string }
  | {
      t: "text";
      text: string;
      size: number;
      fill: string;
      weight: number;
      tracking: number;
      family: "display" | "mono";
    };

export type DrawItem =
  | { t: "poly"; key: string; d: string; fill: string; stroke: string }
  | { t: "stroke"; key: string; d: string; stroke: string; width: number }
  | { t: "group"; key: string; transform: string; shapes: LocalShape[] };

function holesPath(face: Face, holes: NonNullable<FaceDecor["holes"]>) {
  const alongU = face.hu >= face.hv;
  const half = alongU ? face.hu : face.hv;
  const margin = holes.margin ?? 0.4;
  const count = Math.max(1, Math.floor((2 * half - 2 * margin) / holes.pitch) + 1);
  const start = (-(count - 1) * holes.pitch) / 2;
  const rows = holes.rows === 1 ? [0] : [-(holes.rowGap ?? 0.8) / 2, (holes.rowGap ?? 0.8) / 2];
  const r = holes.radius;
  let d = "";
  for (const row of rows) {
    for (let i = 0; i < count; i++) {
      const along = start + i * holes.pitch;
      const [x, y] = alongU ? [along, row] : [row, along];
      d += `M${r3(x - r)} ${r3(y)}a${r} ${r} 0 1 0 ${r3(2 * r)} 0a${r} ${r} 0 1 0 ${r3(-2 * r)} 0`;
    }
  }
  return d;
}

function renderBox(part: BoxPart, proj: Projector, out: DrawItem[]) {
  const c = proj.toCamera;
  for (const face of boxFaces(part)) {
    if (dot(face.normal, c) <= 1e-4) continue;
    const pts = faceCorners(face).map(proj.point);
    out.push({
      t: "poly",
      key: `${part.id}${face.id}`,
      d: toPath(pts),
      fill: shade(part.mat, face.normal, c),
      stroke: MATERIALS[part.mat].stroke,
    });
    const decor = part.decor?.find((d) => d.face === face.id);
    if (!decor) continue;
    const shapes: LocalShape[] = [];
    if (decor.holes) shapes.push({ t: "path", d: holesPath(face, decor.holes), fill: "#050505" });
    if (decor.label)
      shapes.push({
        t: "text",
        text: decor.label.text,
        size: decor.label.size,
        fill: decor.label.fill,
        weight: decor.label.weight ?? 800,
        tracking: decor.label.tracking ?? 0,
        family: decor.label.size < 0.6 ? "mono" : "display",
      });
    out.push({
      t: "group",
      key: `${part.id}${face.id}-decor`,
      transform: proj.matrix(face.center, face.U, face.V),
      shapes,
    });
  }
}

function renderPrism(part: PrismPart, proj: Projector, out: DrawItem[]) {
  const c = proj.toCamera;
  prismGeometry(part).faces.forEach((face, i) => {
    if (dot(face.normal, c) <= 1e-4) return;
    out.push({
      t: "poly",
      key: `${part.id}-${i}`,
      d: toPath(face.pts.map(proj.point)),
      fill: shade(part.mat, face.normal, c),
      stroke: MATERIALS[part.mat].stroke,
    });
  });
}

/** Andrew's monotone chain convex hull. */
function convexHull(points: [number, number][]) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

const RING_SAMPLES = 32;
const ROLLERS = 12;

function renderCylinder(part: CylinderPart, proj: Projector, out: DrawItem[], spin: number) {
  const c = proj.toCamera;
  const axis = unitAxis(part.axis);
  const [e1, e2] = ringBasis(part.axis);
  const facing = dot(axis, c) >= 0 ? 1 : -1;
  const half = part.length / 2;
  const nearCenter = add(part.center, scale(axis, facing * half));
  const farCenter = add(part.center, scale(axis, -facing * half));
  const R = part.radius;
  const angle = part.spins ? spin : 0;

  // Side band: convex hull of both rims.
  const rim: [number, number][] = [];
  for (let i = 0; i < RING_SAMPLES; i++) {
    const th = (i / RING_SAMPLES) * Math.PI * 2;
    rim.push(proj.point(ringPoint(nearCenter, e1, e2, R, th)), proj.point(ringPoint(farCenter, e1, e2, R, th)));
  }
  // Band brightness from the most camera-facing side normal.
  const side = normalize(add(scale(e1, dot(c, e1)), scale(e2, dot(c, e2))));
  const bandMat: MaterialId = part.style.startsWith("mecanum") ? "rubber" : part.mat;
  out.push({
    t: "poly",
    key: `${part.id}-band`,
    d: toPath(convexHull(rim)),
    fill: shade(bandMat, side, c),
    stroke: MATERIALS[bandMat].stroke,
  });

  // Mecanum rollers: 45° helical strips across the tread.
  if (part.style === "mecanum-a" || part.style === "mecanum-b") {
    const hand = part.style === "mecanum-a" ? 1 : -1;
    const sweep = 0.78;
    const rollerHalf = half * 0.9;
    for (let i = 0; i < ROLLERS; i++) {
      const th0 = (i / ROLLERS) * Math.PI * 2 + angle;
      const mid: Vec3 = add(scale(e1, Math.cos(th0)), scale(e2, Math.sin(th0)));
      if (dot(mid, c) < 0.06) continue;
      const pts: [number, number][] = [];
      for (let s = 0; s <= 4; s++) {
        const f = s / 4 - 0.5;
        const th = th0 + hand * sweep * f;
        pts.push(proj.point(ringPoint(add(part.center, scale(axis, 2 * f * rollerHalf)), e1, e2, R * 0.995, th)));
      }
      out.push({
        t: "stroke",
        key: `${part.id}-roller${i}`,
        d: toPath(pts, false),
        stroke: shade("rubber", mid, c),
        width: Math.max(1, proj.pxPerInch * 0.34),
      });
    }
  }

  // Near cap, drawn in its own plane so circles project to exact ellipses.
  const capNormal = scale(axis, facing);
  const transform = proj.matrix(nearCenter, e1, e2);
  const shapes: LocalShape[] = [];
  if (part.style === "mecanum-a" || part.style === "mecanum-b") {
    shapes.push({ t: "circle", cx: 0, cy: 0, r: R, fill: shade("rubber", capNormal, c) });
    shapes.push({ t: "circle", cx: 0, cy: 0, r: R * 0.82, fill: shade("volt", capNormal, c) });
    for (let k = 0; k < 5; k++) {
      const a = angle + (k / 5) * Math.PI * 2;
      shapes.push({
        t: "circle",
        cx: r3(Math.cos(a) * R * 0.5),
        cy: r3(Math.sin(a) * R * 0.5),
        r: R * 0.17,
        fill: "#0b0b0b",
      });
    }
    shapes.push({ t: "circle", cx: 0, cy: 0, r: R * 0.24, fill: shade("alu", capNormal, c) });
    shapes.push({ t: "circle", cx: 0, cy: 0, r: R * 0.09, fill: "#050505" });
  } else if (part.style === "lens") {
    shapes.push({ t: "circle", cx: 0, cy: 0, r: R, fill: "#07090c" });
    shapes.push({ t: "circle", cx: 0, cy: 0, r: R * 0.78, fill: "#0d141c", stroke: "#ffe600", sw: R * 0.12 });
    shapes.push({ t: "circle", cx: 0, cy: 0, r: R * 0.42, fill: "#16222f" });
    shapes.push({ t: "circle", cx: -R * 0.28, cy: R * 0.28, r: R * 0.13, fill: "#ffffff", opacity: 0.85 });
  } else if (part.style === "omni") {
    shapes.push({ t: "circle", cx: 0, cy: 0, r: R, fill: shade("volt", capNormal, c) });
    shapes.push({ t: "circle", cx: 0, cy: 0, r: R * 0.3, fill: "#111" });
  } else {
    shapes.push({ t: "circle", cx: 0, cy: 0, r: R, fill: shade(part.mat, capNormal, c) });
    shapes.push({ t: "circle", cx: 0, cy: 0, r: R * 0.55, fill: shade("alu", capNormal, c) });
  }
  out.push({ t: "group", key: `${part.id}-cap`, transform, shapes });
}

export function renderShaded(parts: Part[], proj: Projector, spin = 0): DrawItem[] {
  const visible = parts.filter((p) => !p.wireOnly);
  const out: DrawItem[] = [];
  for (const i of depthOrder(visible, proj)) {
    const part = visible[i];
    if (part.kind === "box") renderBox(part, proj, out);
    else if (part.kind === "prism") renderPrism(part, proj, out);
    else renderCylinder(part, proj, out, spin);
  }
  return out;
}

/* ───────────────────────────── Wireframe rendering ───────────────────────────── */

const seg = (a: [number, number], b: [number, number]) => `M${r1(a[0])} ${r1(a[1])}L${r1(b[0])} ${r1(b[1])}`;

function wireBox(min: Vec3, max: Vec3, proj: Projector) {
  const p = boxCorners(min, max).map(proj.point);
  // Corner index bits: x = 4, y = 2, z = 1.
  const edges = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [0, 2],
    [1, 3],
    [4, 6],
    [5, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  return edges.map(([a, b]) => seg(p[a], p[b])).join("");
}

function wireCylinder(part: CylinderPart, proj: Projector, spin: number) {
  const axis = unitAxis(part.axis);
  const [e1, e2] = ringBasis(part.axis);
  const half = part.length / 2;
  const R = part.radius;
  const ends = [add(part.center, scale(axis, -half)), add(part.center, scale(axis, half))];
  const N = 24;
  let d = "";
  for (const end of ends) {
    const ring: [number, number][] = [];
    for (let i = 0; i < N; i++) ring.push(proj.point(ringPoint(end, e1, e2, R, (i / N) * Math.PI * 2)));
    d += toPath(ring);
    if (part.style !== "plain") {
      const inner: [number, number][] = [];
      for (let i = 0; i < 12; i++) inner.push(proj.point(ringPoint(end, e1, e2, R * 0.3, (i / 12) * Math.PI * 2)));
      d += toPath(inner);
    }
  }
  const angle = part.spins ? spin : 0;
  if (part.style === "mecanum-a" || part.style === "mecanum-b") {
    const hand = part.style === "mecanum-a" ? 1 : -1;
    for (let i = 0; i < ROLLERS; i++) {
      const th = (i / ROLLERS) * Math.PI * 2 + angle;
      d += seg(
        proj.point(ringPoint(ends[0], e1, e2, R, th - hand * 0.39)),
        proj.point(ringPoint(ends[1], e1, e2, R, th + hand * 0.39)),
      );
    }
  } else {
    for (let i = 0; i < 4; i++) {
      const th = (i / 4) * Math.PI * 2 + angle;
      d += seg(proj.point(ringPoint(ends[0], e1, e2, R, th)), proj.point(ringPoint(ends[1], e1, e2, R, th)));
    }
  }
  return d;
}

function wirePrism(part: PrismPart, proj: Projector) {
  const { back, front } = prismGeometry(part);
  const b = back.map(proj.point);
  const f = front.map(proj.point);
  let d = toPath(b) + toPath(f);
  for (let i = 0; i < b.length; i++) d += seg(b[i], f[i]);
  return d;
}

export type WireframeResult = Record<Subsystem, string> & { fills: Record<Subsystem, string> };

/** Edge paths for every part, grouped by subsystem, plus camera-facing face fills. */
export function renderWireframe(parts: Part[], proj: Projector, spin = 0): WireframeResult {
  const edges: Record<Subsystem, string> = { drivetrain: "", vision: "", scoring: "", frame: "" };
  const fills: Record<Subsystem, string> = { drivetrain: "", vision: "", scoring: "", frame: "" };
  const c = proj.toCamera;
  for (const part of parts) {
    if (part.kind === "box") {
      edges[part.sys] += wireBox(part.min, part.max, proj);
      for (const face of boxFaces(part))
        if (dot(face.normal, c) > 1e-4) fills[part.sys] += toPath(faceCorners(face).map(proj.point));
    } else if (part.kind === "prism") {
      edges[part.sys] += wirePrism(part, proj);
      for (const face of prismGeometry(part).faces)
        if (dot(face.normal, c) > 1e-4) fills[part.sys] += toPath(face.pts.map(proj.point));
    } else {
      edges[part.sys] += wireCylinder(part, proj, spin);
    }
  }
  return { ...edges, fills };
}

/** Wireframe box edges for arbitrary bounds (e.g. the sizing envelope). */
export const wireBounds = (min: Vec3, max: Vec3, proj: Projector) => wireBox(min, max, proj);

/** Projected circle on the ground plane (y = 0), sampled as a closed path. */
export function groundCircle(radius: number, proj: Projector, samples = 72, center: Vec3 = [0, 0, 0]) {
  const pts: [number, number][] = [];
  for (let i = 0; i < samples; i++) {
    const th = (i / samples) * Math.PI * 2;
    pts.push(proj.point([center[0] + radius * Math.cos(th), center[1], center[2] + radius * Math.sin(th)]));
  }
  return toPath(pts);
}

/** Grid lines on the ground plane within a disc, with per-line fade by distance. */
export function groundGrid(radius: number, spacing: number, offsetZ: number, proj: Projector) {
  const lines: { d: string; opacity: number }[] = [];
  const steps = Math.ceil(radius / spacing);
  const wrap = ((offsetZ % spacing) + spacing) % spacing;
  for (let i = -steps; i <= steps; i++) {
    // Lines across the robot's path (scroll with the drive animation).
    const z = i * spacing + wrap - spacing / 2;
    if (Math.abs(z) < radius) {
      const w = Math.sqrt(radius * radius - z * z);
      lines.push({
        d: seg(proj.point([-w, 0, z]), proj.point([w, 0, z])),
        opacity: Math.pow(1 - Math.abs(z) / radius, 1.4),
      });
    }
    // Lines along the robot's path (static).
    const x = i * spacing;
    if (Math.abs(x) < radius) {
      const w = Math.sqrt(radius * radius - x * x);
      lines.push({
        d: seg(proj.point([x, 0, -w]), proj.point([x, 0, w])),
        opacity: Math.pow(1 - Math.abs(x) / radius, 1.4),
      });
    }
  }
  return lines;
}
