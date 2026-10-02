import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import type { IconName } from "../icon-data";
import { Pill } from "../primitives";
import { KITCHEN_HERO_IMG, KITCHEN_HERO_VIDEO } from "./data";

/** The three promises the old page made, kept word for word. */
const trust: { icon: IconName; label: string }[] = [
  { icon: "Clock", label: "ביום עבודה אחד בלבד" },
  { icon: "Home", label: "בלי לכלוך, בלי אבק, בלי רעש" },
  { icon: "ShieldCheck", label: "עמידות גבוהה לחום, אדים ולחות" },
];

/**
 * Opening screen of the kitchen-coating page: the copy centred on the page ground,
 * then a framed 16:9 silent loop with the three promises docked onto its lower edge.
 * Holds the page's single H1 — the phrase the page ranks for.
 */
export function KitchenHero() {
  return (
    <section className="border-b border-border pb-10 lg:pb-16">
      <div className="flex flex-col items-center px-5 pt-6 text-center lg:px-12 lg:pt-10">
        <nav aria-label="פירורי לחם" className="flex items-center gap-2 fs-14 text-foreground lg:fs-15">
          <Link to="/" className="transition-colors duration-160 ease-standard hover:text-clay">
            בית
          </Link>
          <Icon name="AngleLeft" size={11} />
          <span aria-current="page" className="font-medium">
            ציפוי מטבחים
          </span>
        </nav>

        <Pill className="mt-3 flex-none tracking-[0.16em] whitespace-nowrap lg:mt-4">סולודור · חידוש מטבחים</Pill>

        <h1 className="mt-3 fs-44 leading-[1.05] font-bold tracking-[-0.02em] text-foreground lg:mt-5 lg:fs-92">
          ציפוי מטבחים
        </h1>

        <h2 className="mt-2 fs-20 leading-[1.3] font-medium text-foreground lg:mt-3 lg:fs-30">
          הדבקת טפט על מטבחים בפריסה רחבה
        </h2>

        <div className="mt-5 flex w-full flex-col items-stretch gap-2 lg:mt-7 lg:w-auto lg:flex-row lg:items-center lg:gap-3">
          <Button asChild className="flex-none px-7 py-3 lg:px-10 lg:py-[0.9375rem]">
            <a href="#">
              <span>להתייעצות בווצאפ</span>
              <Icon name="ArrowLeft" size={16} />
            </a>
          </Button>
          <Button asChild variant="secondary" className="flex-none px-7 py-3 lg:px-10 lg:py-[0.9375rem]">
            <a href="#catalog">
              <span>לקטלוג ציפויי המטבח</span>
              <Icon name="ArrowLeft" size={16} />
            </a>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-7 w-full max-w-275 px-5 lg:mt-10 lg:px-12">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={KITCHEN_HERO_IMG}
            aria-label="ציפוי מטבחים – מטבח מחודש בהדבקת טפט של סולודור"
            className="absolute inset-0 block size-full object-cover"
          >
            <source src={KITCHEN_HERO_VIDEO} type="video/mp4" />
          </video>
        </div>

        <ul className="relative mx-3 -mt-5 grid grid-cols-3 rounded-lg border border-border bg-card shadow-menu lg:mx-auto lg:-mt-12 lg:max-w-200">
          {trust.map((item, i) => (
            <li
              key={item.label}
              className={cn(
                "flex flex-col items-center gap-1.5 px-2 py-4 text-center lg:flex-row lg:justify-center lg:gap-3.5 lg:px-5 lg:py-6 lg:text-right",
                i > 0 && "border-s border-border",
              )}
            >
              <span className="inline-flex flex-none text-clay [&_svg]:size-6 lg:[&_svg]:size-[1.875rem]!">
                <Icon name={item.icon} size={30} />
              </span>
              <span className="fs-12 leading-[1.4] font-medium text-balance text-foreground lg:fs-16">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
