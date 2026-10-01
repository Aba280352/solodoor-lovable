import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Icon } from "./Icon";
import { Container } from "./primitives";
import {
  FOOTER_BANNER,
  LOGO_SRC,
  PAYMENTS_SRC,
  footerColumns,
  footerContact,
  footerLegal,
  footerSocial,
} from "./data";

export function SiteFooter() {
  return (
    <footer data-reveal>
      <div className="relative">
        <div className="relative h-96 overflow-hidden bg-muted lg:h-130">
          <img src={FOOTER_BANNER} alt="דלת כניסה מחודשת" className="absolute inset-0 block size-full object-cover" />
          <div className="absolute inset-0 bg-footer-scrim" />
          <div className="absolute inset-y-0 right-0 flex w-full flex-col items-start justify-center gap-5.5 px-5 text-right lg:w-[52%] lg:px-27">
            <span className="fs-36 leading-[1.08] font-medium text-background lg:fs-52">
              דלת חדשה,
              <br />
              אותו בית,
              <br />
              הרגשה אחרת
            </span>
            <span className="block h-0.5 w-18 bg-primary" />
            <span dir="ltr" className="fs-20 leading-[1.45] font-medium text-clay lg:fs-24">
              Small Change
              <br />
              Big Difference
            </span>
          </div>
        </div>

        <div className="bg-background pt-14">
          <Container>
            <div className="grid grid-cols-2 items-start gap-x-6 gap-y-10 lg:grid-cols-[1.15fr_0.85fr_1fr_1.5fr] lg:gap-9">
              <div className="col-span-full text-right lg:col-span-1">
                <img src={LOGO_SRC} alt="SOLODOOR" className="block h-11 w-37.5" />
                <span className="mt-3 block fs-16 leading-[1.7] text-foreground">ציפוי דלתות. בדיוק הסגנון שלכם.</span>
                <div className="mt-5 flex items-center gap-3">
                  {footerSocial.map((social) => (
                    <a
                      key={social.label}
                      href="#"
                      aria-label={social.label}
                      className="inline-flex size-10.5 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors duration-240 ease-standard hover:bg-secondary hover:text-secondary-foreground"
                    >
                      <Icon name={social.icon} size={20} />
                    </a>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3.5">
                  {footerContact.map((contact) => (
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
                  <span className="block fs-19 font-semibold text-foreground">{column.title}</span>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {column.links.map((link) => (
                      <a
                        key={link}
                        href="#"
                        className="flex items-center justify-between gap-2.5 fs-16 text-foreground transition-colors duration-160 ease-standard hover:text-clay"
                      >
                        <span>{link}</span>
                        <Icon name="AngleLeft" size={13} />
                      </a>
                    ))}
                  </div>
                </div>
              ))}

              <div className="col-span-full flex flex-col lg:col-span-1">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="rounded-[0.5rem] border border-border bg-card px-5 pt-7 pb-7.5 text-right lg:px-7.5"
                >
                  <span className="block fs-28 font-medium text-foreground">השאירו פרטים</span>
                  <span className="mt-1.5 block fs-16 text-foreground">ואנחנו נחזור אליכם בהקדם</span>
                  <div className="mt-5 flex flex-col gap-3">
                    <Input type="text" placeholder="שם מלא" className="bg-background fs-16" />
                    <Input type="tel" placeholder="טלפון" className="bg-background fs-16" />
                    <Input type="email" placeholder="אימייל" className="bg-background fs-16" />
                    <Button type="submit" className="px-5 py-[0.9375rem]">
                      <span>שלחו פרטים</span>
                      <Icon name="ArrowLeft" size={15} />
                    </Button>
                  </div>
                  <label className="mt-4 flex cursor-pointer items-center gap-2.5 fs-15 text-foreground">
                    <input type="checkbox" className="m-0 size-4 cursor-pointer accent-primary" />
                    <span>
                      אני מאשר/ת את{" "}
                      <a href="#" className="border-b border-primary text-foreground">
                        מדיניות הפרטיות
                      </a>
                    </span>
                  </label>
                </form>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 pb-6 lg:mt-12 lg:flex-row lg:flex-wrap lg:gap-6 lg:pb-9">
              <img
                src={PAYMENTS_SRC}
                alt="אמצעי תשלום: ויזה, מאסטרקארד, דיינרס, ביט, אפל פיי, גוגל פיי, ישראכרט"
                className="block h-auto w-125 max-w-full"
              />
              <div className="flex flex-wrap items-center justify-center gap-4.5 fs-15 text-foreground">
                {footerLegal.map((label, i) => (
                  <Fragment key={label}>
                    {i > 0 && <span className="block h-3 w-px bg-border" />}
                    <a href="#" className="text-foreground">
                      {label}
                    </a>
                  </Fragment>
                ))}
              </div>
              <span className="text-center fs-15 text-foreground">© 2026 כל הזכויות שמורות לסולודור</span>
            </div>
          </Container>
        </div>
      </div>
    </footer>
  );
}
