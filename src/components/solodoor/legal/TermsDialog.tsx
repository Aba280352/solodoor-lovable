import type { ReactNode } from "react";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Icon } from "../Icon";
import { LegalBlockView } from "./LegalPage";
import { LEGAL_UPDATED, TERMS } from "./legal-content";

/**
 * The terms of use in a pop-up, opened from the link passed as `children`.
 * It renders the same text as the /terms page, so a change of the terms shows here as well.
 * With `section` (the id of a section, e.g. "installation") the pop-up opens scrolled to that section.
 */
export function TermsDialog({ children, section }: { children: ReactNode; section?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        overlayClassName="items-center justify-center p-4 lg:p-8"
        className="flex max-h-[88dvh] w-full max-w-190 flex-col overflow-hidden rounded-[1rem] bg-background text-right"
        onOpenAutoFocus={(event) => {
          const target = section ? document.getElementById(`terms-dialog-${section}`) : null;
          if (!target) return;
          event.preventDefault();
          target.scrollIntoView({ block: "start" });
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 lg:px-8 lg:py-5">
          <div className="flex flex-col gap-1">
            <DialogTitle className="fs-22 leading-[1.2] font-bold text-foreground lg:fs-26">{TERMS.title}</DialogTitle>
            <DialogDescription className="fs-15 text-foreground">עודכן לאחרונה: {LEGAL_UPDATED}</DialogDescription>
          </div>
          <DialogClose aria-label="סגירה" className="inline-flex size-10 flex-none cursor-pointer items-center justify-center text-foreground">
            <Icon name="Times" size={22} />
          </DialogClose>
        </div>
        <div className="flex flex-col gap-8 overflow-y-auto px-5 py-6 lg:px-8 lg:py-7">
          <p className="fs-17 leading-[1.9] text-pretty text-foreground">{TERMS.intro}</p>
          {TERMS.sections.map((section, i) => (
            <section key={section.id} id={`terms-dialog-${section.id}`} className="flex scroll-mt-4 flex-col gap-4">
              <h3 className="fs-20 leading-[1.25] font-bold text-foreground lg:fs-22">
                {i + 1}. {section.title}
              </h3>
              {section.blocks.map((block, j) => (
                <LegalBlockView key={j} block={block} />
              ))}
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
