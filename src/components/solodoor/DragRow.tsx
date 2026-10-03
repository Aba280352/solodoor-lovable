import { useRef, type HTMLAttributes } from "react";

import { useDragScroll } from "@/hooks/use-drag-scroll";

/** A horizontally scrolling row that a mouse can drag too (touch scrolls natively). */
export function DragRow(props: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  useDragScroll(ref);
  return <div ref={ref} {...props} />;
}
