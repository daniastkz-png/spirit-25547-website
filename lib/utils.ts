import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class lists, letting later utilities win over earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Zero-pad a number for HUD-style readouts, e.g. pad(7) → "07". */
export function pad(value: number, length = 2) {
  return String(value).padStart(length, "0");
}
