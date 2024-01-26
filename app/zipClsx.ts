import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges together arrays of class names, which can be either string or object values,
 * and returns a single string of space-separated class names.
 *
 *
 * @param {...Array<string|Object>} inputs - Any number of arrays of class names to merge.
 * @returns {string} - A single string of space-separated class names.
 */
export function zipClsx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
