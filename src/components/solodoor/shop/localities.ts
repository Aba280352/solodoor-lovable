/** Every locality in Israel, loaded when the installation field is first shown (not part of every page). */
import { useEffect, useState } from "react";

import type { LocalityRow } from "./install-areas";

let cached: Promise<LocalityRow[]> | null = null;

export function loadLocalities(): Promise<LocalityRow[]> {
  cached ??= import("./localities.json").then((module) => module.default as LocalityRow[]);
  return cached;
}

/** The localities, or null until they are loaded (or when `enabled` is false). */
export function useLocalities(enabled: boolean): LocalityRow[] | null {
  const [rows, setRows] = useState<LocalityRow[] | null>(null);
  useEffect(() => {
    if (!enabled || rows) return;
    let live = true;
    loadLocalities().then((loaded) => live && setRows(loaded));
    return () => {
      live = false;
    };
  }, [enabled, rows]);
  return rows;
}
