import type { HTMLAttributes, ImgHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Page container: 1320px max, 48px side padding on desktop, 20px on mobile. */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto max-w-330 px-5 lg:px-12", className)} {...props} />;
}

/** Clay pill used for eyebrows and tags. */
export function Pill({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-primary px-4.5 py-[0.4375rem] fs-15 font-semibold text-primary-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** Image that fills its (relative, overflow-hidden) frame and never distorts. */
export function CoverImage({ className, alt = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      alt={alt}
      draggable={false}
      className={cn("absolute inset-0 block size-full select-none object-cover", className)}
      {...props}
    />
  );
}

/** Labelled stand-in for a product photo that has not been supplied yet. */
export function MediaPlaceholder({ label }: { label: string }) {
  return (
    <span className="absolute inset-0 flex items-center justify-center p-5 text-center fs-15 tracking-[0.16em] text-foreground">
      תמונה: {label}
    </span>
  );
}
