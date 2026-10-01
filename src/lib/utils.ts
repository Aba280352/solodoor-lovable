import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teaches tailwind-merge about the project's `fs-<n>` font-size utility (see
// styles.css), so `cn("fs-15", "fs-18")` keeps only the last one.
const twMerge = extendTailwindMerge<"fs">({
  extend: {
    classGroups: {
      fs: [{ fs: [(value: string) => /^\d+$/.test(value)] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
