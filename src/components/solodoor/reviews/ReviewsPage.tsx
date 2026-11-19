import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Icon } from "../Icon";
import { ReviewCard, Stars } from "../Reviews";
import { Container, Pill } from "../primitives";
import { GOOGLE_WORDMARK } from "../data";
import { business } from "../content/business";
import { whatsappHref } from "../whatsapp";
import { REVIEWS_LIST, REVIEWS_LIST_DEFAULTS } from "../content/reviews";
import { useSection } from "../content/sections";

/** All the reviews, in one tidy grid. */
export function ReviewsPage() {
  const items = useSection(REVIEWS_LIST, REVIEWS_LIST_DEFAULTS).items as { name: string; date: string; text: string; color?: string }[];
  const list = items.map((r, i) => ({ ...r, i }));
  return (
    <>
      <section className="border-b border-border">
        <Container className="pt-6 pb-9 text-right lg:pt-8 lg:pb-12">
          <nav aria-label="פירורי לחם" className="flex items-center gap-2 fs-14 text-foreground lg:fs-15">
            <Link to="/" className="transition-colors duration-160 ease-standard hover:text-clay">
              בית
            </Link>
            <Icon name="AngleLeft" size={11} />
            <span aria-current="page" className="font-medium">
              ביקורות
            </span>
          </nav>
          <Pill className="mt-5 tracking-[0.16em]">ביקורות מגוגל</Pill>
          <h1 className="mt-4 fs-36 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:fs-62">ביקורות לקוחות על סולודור</h1>
          <p className="mt-4 max-w-[64ch] fs-18 leading-[1.7] text-foreground lg:fs-20">
            מה אומרים לקוחות שחידשו אצלנו דלת, מטבח, מקרר או קיר. כל הביקורות כאן הן ביקורות אמיתיות מהפרופיל שלנו בגוגל.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Stars className="gap-1 fs-30" />
            <span className="fs-18 font-semibold text-foreground">מבוסס על {business.reviewCount} ביקורות</span>
            <img src={GOOGLE_WORDMARK} alt="Google" className="block h-8 w-auto" />
          </div>
        </Container>
      </section>

      <section className="pt-10 pb-14 lg:pt-14 lg:pb-20">
        <Container>
          <h2 className="fs-28 leading-[1.15] font-bold tracking-[-0.02em] text-foreground lg:fs-40">הביקורות האחרונות</h2>
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-6">
            {list.map((review) => (
              <li key={review.i} className="flex">
                <ReviewCard review={review} className="w-full lg:w-full" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-border py-12 lg:py-16">
        <Container className="flex flex-col items-center gap-5 text-center">
          <h2 className="fs-28 leading-[1.15] font-bold tracking-[-0.02em] text-foreground lg:fs-40">רוצים לראות את זה על הדלת שלכם?</h2>
          <p className="max-w-[50ch] fs-18 leading-[1.7] text-foreground">שלחו תמונה בווצאפ, ונחזור אליכם עם המלצה והצעה.</p>
          <div className="flex w-full flex-col items-stretch gap-3 lg:w-auto lg:flex-row">
            <Button asChild className="px-7 py-4">
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                <span>לשיחה בווצאפ</span>
                <Icon name="ArrowLeft" size={16} />
              </a>
            </Button>
            <Button asChild variant="secondary" className="px-7 py-4">
              <Link to="/חנות">
                <span>לחנות</span>
                <Icon name="ArrowLeft" size={16} />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
