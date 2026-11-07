import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Icon } from "./Icon";
import type { IconName } from "./icon-data";
import { PageShell } from "./PageShell";
import { Container, Pill } from "./primitives";
import { whatsappHref } from "./whatsapp";

/** The site's main doors, offered when an address does not exist. */
const PAGES: { to: string; label: string; text: string; icon: IconName }[] = [
  { to: "/ציפוי-דלתות", label: "ציפוי דלתות", text: "דלת חדשה בלי להחליף אותה", icon: "DoorClosed" },
  { to: "/ציפוי-מטבחים", label: "ציפוי מטבחים", text: "מטבח מחודש ביום עבודה אחד", icon: "Home" },
  { to: "/טפט-לפי-סגנון", label: "טפט לפי סגנון", text: "עץ, חלק, אבן ובטון", icon: "Palette" },
  { to: "/שאלות-נפוצות", label: "שאלות נפוצות", text: "מדידה, התקנה ומשלוח", icon: "InfoCircle" },
];

/**
 * "The page was not found" (HTTP 404), in the site's own look: header and footer, a short apology, and a way on:
 * the shop, WhatsApp, and the main pages. An old or mistyped link should still end in a sale or a conversation.
 */
export function NotFoundPage() {
  return (
    <PageShell>
      <section className="border-b border-border">
        <Container className="flex flex-col items-center pt-12 pb-14 text-center lg:pt-20 lg:pb-20">
          <Pill className="tracking-[0.16em]">שגיאה 404</Pill>
          <span aria-hidden="true" className="mt-6 fs-76 leading-none font-bold tracking-[-0.04em] text-primary/30 lg:mt-8 lg:fs-108">
            404
          </span>
          <h1 className="mt-4 fs-34 leading-[1.1] font-bold tracking-[-0.02em] text-balance text-foreground lg:fs-58">הדף שחיפשתם לא נמצא</h1>
          <p className="mt-4 max-w-[52ch] fs-18 leading-[1.7] text-pretty text-foreground lg:mt-5 lg:fs-20">
            ייתכן שהקישור ישן או שהדף עבר מקום. אבל טוב שהגעתם: מעל 200 עיצובים מחכים לכם בחנות, ואנחנו כאן לעזור לבחור.
          </p>

          <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2 lg:mt-10">
            <Button asChild className="px-9">
              <Link to="/חנות">
                <span>לחנות של סולודור</span>
                <Icon name="ShoppingBag" size={17} />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="px-9">
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                <span>להתייעצות בווצאפ</span>
                <Icon name="ChatDots" size={17} />
              </a>
            </Button>
          </div>
        </Container>
      </section>

      <section className="pt-10 pb-16 lg:pt-14 lg:pb-24">
        <Container>
          <h2 className="text-center fs-22 font-bold text-foreground lg:fs-28">או שאולי חיפשתם את אחד מאלה?</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:mt-8 lg:grid-cols-4 lg:gap-6">
            {PAGES.map((page) => (
              <Link
                key={page.to}
                to={page.to}
                className="group flex flex-col items-start gap-3 rounded-lg border border-border bg-card px-4 py-5 text-right transition-colors duration-240 ease-standard hover:border-foreground lg:px-6 lg:py-7"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-full border border-primary text-clay">
                  <Icon name={page.icon} size={20} />
                </span>
                <span className="fs-17 font-bold text-foreground lg:fs-20">{page.label}</span>
                <span className="fs-14 leading-[1.5] text-foreground lg:fs-16">{page.text}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 fs-14 font-semibold text-foreground transition-[gap,color] duration-240 ease-standard group-hover:gap-3 group-hover:text-clay lg:fs-15">
                  למעבר לדף
                  <Icon name="ArrowLeft" size={14} />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
