import { Fragment, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Icon } from "./Icon";
import { business } from "./content/business";
import { useFooterContent, useNav } from "./content/nav";
import { useEditMark } from "./content/layout";
import { formValues, submitLead } from "./leads";
import { whatsappHref } from "./whatsapp";
import { Container } from "./primitives";
import { FOOTER_ANCHORS, scrollToAboutOnHome, scrollToFooterAnchor } from "./shop/footer-anchors";
import { shopSearchFor } from "./shop/links";
import {
  FOOTER_BANNER,
  INSTAGRAM_URL,
  LOGO_SRC,
  PAYMENTS_SRC,
  footerColumns,
  footerContact,
  footerLegal,
  footerSocial,
} from "./data";

/** The contact lines of the footer, with the business details in force (editable in the admin). */
const contactLines = () =>
  footerContact.map((c) => ({
    ...c,
    value: c.icon === "Phone" ? business.phone : c.icon === "Envelope" ? business.email : c.icon === "MapPin" ? business.area : c.icon === "Clock" ? business.hours : c.value,
  }));

const footerLinkClass =
  "flex items-center justify-between gap-2.5 fs-16 text-foreground transition-colors duration-160 ease-standard hover:text-clay";

/** Pages that exist get a real link; the rest stay placeholders for now. */
const FOOTER_PATHS: Record<string, "/" | "/ציפוי-דלתות" | "/ציפוי-מטבחים" | "/מאמרים" | "/שאלות-נפוצות"> = {
  "דף הבית": "/",
  "ציפוי דלתות": "/ציפוי-דלתות",
  מאמרים: "/מאמרים",
  "שאלות נפוצות": "/שאלות-נפוצות",
};

/** Links that leave the site. */
const FOOTER_EXTERNAL: Record<string, string> = { "גלריה": INSTAGRAM_URL };

function FooterLink({ label, category }: { label: string; category: boolean }) {
  const nav = useNav();
  const inner = (
    <>
      <span>{nav.label(label)}</span>
      <Icon name="AngleLeft" size={13} />
    </>
  );
  if (label === "אודות") {
    // The real "about" section lives on the home page.
    return (
      <Link
        to="/"
        hash="about"
        onClick={(e) => {
          if (scrollToAboutOnHome()) e.preventDefault();
        }}
        className={footerLinkClass}
      >
        {inner}
      </Link>
    );
  }
  const anchor = FOOTER_ANCHORS[label];
  if (anchor) {
    return (
      <a
        href={`#${anchor}`}
        onClick={(e) => {
          e.preventDefault();
          scrollToFooterAnchor(anchor);
        }}
        className={footerLinkClass}
      >
        {inner}
      </a>
    );
  }
  if (category) {
    return (
      <Link to="/חנות" search={shopSearchFor(label)} className={footerLinkClass}>
        {inner}
      </Link>
    );
  }
  const external = FOOTER_EXTERNAL[label];
  if (external) {
    return (
      <a href={external} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
        {inner}
      </a>
    );
  }
  const to = FOOTER_PATHS[label];
  if (to) {
    return (
      <Link to={to} className={footerLinkClass}>
        {inner}
      </Link>
    );
  }
  return (
    <a href="#" className={footerLinkClass}>
      {inner}
    </a>
  );
}

/** The footer's contact form: name, phone, email and the privacy consent. */
function FooterLeadForm() {
  const footer = useFooterContent();
  const mark = useEditMark();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await submitLead({ source: "footer", name: v.name, phone: v.phone, email: v.email, website: v.website });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-[0.5rem] border border-border bg-card px-5 pt-7 pb-7.5 text-right lg:px-7.5">
      <span {...mark("formTitle", "field")} className="block fs-28 font-medium text-foreground">{footer.formTitle ?? "השאירו פרטים"}</span>
      <span {...mark("formSubtitle", "field")} className="mt-1.5 block fs-16 text-foreground">{footer.formSubtitle ?? "ואנחנו נחזור אליכם בהקדם"}</span>
      {sent ? (
        <div role="status" className="mt-5 flex items-center gap-3 rounded-md bg-muted px-4 py-3.5">
          <span className="inline-flex text-clay">
            <Icon name="CheckCircle" size={22} />
          </span>
          <span className="fs-16 font-medium text-foreground">קיבלנו, נחזור אליכם בהקדם.</span>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-col gap-3">
            <Input type="text" name="name" required autoComplete="name" placeholder="שם מלא" className="bg-background fs-16" />
            <Input type="tel" name="phone" required autoComplete="tel" placeholder="טלפון" className="bg-background fs-16" />
            <Input type="email" name="email" autoComplete="email" placeholder="אימייל" className="bg-background fs-16" />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            {error && <p role="alert" className="fs-15 font-medium text-clay">{error}</p>}
            <Button type="submit" disabled={busy} className="px-5 py-[0.9375rem]">
              <span>{busy ? "שולחים…" : "שלחו פרטים"}</span>
              <Icon name="ArrowLeft" size={15} />
            </Button>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2.5 fs-15 text-foreground">
            <input type="checkbox" name="privacy" required className="m-0 size-4 cursor-pointer accent-primary" />
            <span>
              אני מאשר/ת את{" "}
              <Link to="/privacy-policy" target="_blank" className="border-b border-primary text-foreground">
                מדיניות הפרטיות
              </Link>
            </span>
          </label>
        </>
      )}
    </form>
  );
}

export function SiteFooter() {
  const nav = useNav();
  const footer = useFooterContent();
  const mark = useEditMark();
  const bannerLines = ["דלת חדשה,", "אותו בית,", "הרגשה אחרת"].map((line, i) => footer.bannerLines[i] ?? line);
  const bannerEnglish = ["Small Change", "Big Difference"].map((line, i) => footer.bannerEnglish[i] ?? line);
  return (
    <footer data-reveal data-edit-section="footer" data-edit-label="פוטר">
      <div className="relative">
        <div className="relative h-96 overflow-hidden bg-muted lg:h-130">
          <img {...mark("bannerImage")} src={footer.bannerImage ?? FOOTER_BANNER} alt="דלת כניסה מחודשת" className="absolute inset-0 block size-full object-cover" />
          <div className="absolute inset-0 bg-footer-scrim" />
          <div className="absolute inset-y-0 right-0 flex w-full flex-col items-start justify-center gap-5.5 px-5 text-right lg:w-[52%] lg:px-27">
            <span {...mark("bannerLines", "field")} className="fs-36 leading-[1.08] font-medium text-background lg:fs-52">
              {bannerLines[0]}
              <br />
              {bannerLines[1]}
              <br />
              {bannerLines[2]}
            </span>
            <span className="block h-0.5 w-18 bg-primary" />
            <span {...mark("bannerEnglish", "field")} dir="ltr" className="fs-20 leading-[1.45] font-medium text-clay lg:fs-24">
              {bannerEnglish[0]}
              <br />
              {bannerEnglish[1]}
            </span>
          </div>
        </div>

        <div className="bg-background pt-14">
          <Container>
            <div className="grid grid-cols-2 items-start gap-x-6 gap-y-10 lg:grid-cols-[1.15fr_0.85fr_1fr_1.5fr] lg:gap-9">
              <div className="col-span-full text-right lg:col-span-1">
                <img src={LOGO_SRC} alt="SOLODOOR" className="block h-11 w-37.5" />
                <span {...mark("tagline", "field")} className="mt-3 block fs-16 leading-[1.7] text-foreground">{footer.tagline ?? "ציפוי דלתות. בדיוק הסגנון שלכם."}</span>
                <div className="mt-5 flex items-center gap-3">
                  {footerSocial.map((social) => (
                    <a
                      key={social.label}
                      href={(social.icon === "ChatDots" ? whatsappHref() : social.href) ?? "#"}
                      {...(social.href ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      aria-label={social.label}
                      className="inline-flex size-10.5 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors duration-240 ease-standard hover:bg-secondary hover:text-secondary-foreground"
                    >
                      <Icon name={social.icon} size={20} />
                    </a>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3.5">
                  {contactLines().map((contact) => (
                    <div key={contact.value} className="flex items-center gap-3">
                      <span className="inline-flex size-8.5 flex-none items-center justify-center rounded-lg border border-primary bg-primary text-primary-foreground">
                        <Icon name={contact.icon} size={16} />
                      </span>
                      <span dir={contact.dir} className="fs-16 font-medium text-foreground">
                        {contact.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {footerColumns.map((column) => (
                <div key={column.title} className="text-right">
                  <span className="block fs-19 font-semibold text-foreground">{nav.label(column.title)}</span>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {column.links.filter(nav.shown).map((link) => (
                      <FooterLink key={link} label={link} category={column.title === "קטגוריות"} />
                    ))}
                  </div>
                </div>
              ))}

              <div id="contact" className="col-span-full flex scroll-mt-24 flex-col lg:col-span-1">
                <FooterLeadForm />
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 pb-6 lg:mt-12 lg:flex-row lg:flex-wrap lg:gap-6 lg:pb-9">
              <img
                src={PAYMENTS_SRC}
                alt="אמצעי תשלום: ויזה, מאסטרקארד, דיינרס, ביט, אפל פיי, גוגל פיי, ישראכרט"
                className="block h-auto w-125 max-w-full"
              />
              <div className="flex flex-wrap items-center justify-center gap-4.5 fs-15 text-foreground">
                {footerLegal.filter(({ label }) => nav.shown(label)).map(({ label, to }, i) => (
                  <Fragment key={label}>
                    {i > 0 && <span className="block h-3 w-px bg-border" />}
                    <Link to={to} className="text-foreground transition-colors duration-160 ease-standard hover:text-clay">
                      {nav.label(label)}
                    </Link>
                  </Fragment>
                ))}
              </div>
              <span {...mark("copyright", "field")} className="text-center fs-15 text-foreground">{footer.copyright ?? "© 2026 כל הזכויות שמורות לסולודור"}</span>
            </div>
          </Container>
        </div>
      </div>
    </footer>
  );
}
