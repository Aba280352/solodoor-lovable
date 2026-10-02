import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Icon } from "../Icon";
import type { IconName } from "../icon-data";
import { Pill } from "../primitives";
import { KITCHEN_HERO_IMG } from "./data";

/** The three promises the old page made, kept word for word. */
const trust: { icon: IconName; label: string }[] = [
  { icon: "Clock", label: "ביום עבודה אחד בלבד" },
  { icon: "Home", label: "בלי לכלוך, בלי אבק, בלי רעש" },
  { icon: "ShieldCheck", label: "עמידות גבוהה לחום, אדים ולחות" },
];

/**
 * Opening screen of the kitchen-coating page. Same layout as the homepage hero,
 * with one photo and the page's single H1 — the exact phrase the page ranks for.
 */
export function KitchenHero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="relative h-[52vw] overflow-hidden bg-muted lg:absolute lg:inset-x-0 lg:top-0 lg:h-162.5">
        <img
          src={KITCHEN_HERO_IMG}
          alt="ציפוי מטבחים – מטבח מחודש בהדבקת טפט של סולודור"
          className="absolute inset-0 block size-full object-cover object-left"
        />
      </div>

      <div className="relative lg:grid lg:h-162.5 lg:grid-cols-2 lg:items-stretch">
        <div className="flex min-w-0 flex-col items-center justify-center px-5 pt-5 pb-6 text-center lg:px-22 lg:py-12">
          <nav aria-label="פירורי לחם" className="flex items-center gap-2 fs-14 text-foreground lg:fs-15">
            <Link to="/" className="transition-colors duration-160 ease-standard hover:text-clay">
              בית
            </Link>
            <Icon name="AngleLeft" size={11} />
            <span aria-current="page" className="font-medium">
              ציפוי מטבחים
            </span>
          </nav>

          <Pill className="mt-3 flex-none tracking-[0.16em] whitespace-nowrap lg:mt-5">סולודור · חידוש מטבחים</Pill>

          <h1 className="mt-3 fs-40 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:mt-6 lg:fs-76">
            ציפוי מטבחים
          </h1>

          <h2 className="mt-2 max-w-[22ch] fs-20 leading-[1.3] font-medium text-foreground lg:mt-4 lg:fs-28">
            הדבקת טפט על מטבחים בפריסה רחבה
          </h2>

          <div className="mt-4 flex w-full flex-col items-stretch gap-2 lg:mt-9 lg:w-auto lg:flex-row lg:items-center lg:gap-3">
            <Button asChild className="flex-none px-7 py-3 lg:py-[0.9375rem]">
              <a href="#">
                <span>להתייעצות בווצאפ</span>
                <Icon name="ArrowLeft" size={16} />
              </a>
            </Button>
            <Button asChild variant="secondary" className="flex-none px-7 py-3 lg:py-[0.9375rem]">
              <a href="#catalog">
                <span>לקטלוג ציפויי המטבח</span>
                <Icon name="ArrowLeft" size={16} />
              </a>
            </Button>
          </div>

          <div className="mt-5 flex w-full items-start justify-center gap-3 border-t border-foreground/14 pt-4 lg:mt-12 lg:gap-6 lg:pt-8.5">
            {trust.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-1.5 lg:gap-2.5">
                <span className="inline-flex text-foreground [&_svg]:size-7 lg:[&_svg]:size-[2.125rem]!">
                  <Icon name={item.icon} size={34} />
                </span>
                <span className="fs-13 leading-[1.45] font-medium text-balance text-foreground lg:fs-15">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden min-w-0 lg:block" />
      </div>
    </section>
  );
}
