import { Link } from "@tanstack/react-router";

import { Icon } from "../Icon";
import { Container, Pill } from "../primitives";
import { CONTACT, LEGAL_DOCS, LEGAL_UPDATED, type LegalBlock, type LegalDoc } from "./legal-content";

function Block({ block }: { block: LegalBlock }) {
  if (block.type === "p") {
    return <p className="fs-17 leading-[1.9] text-pretty text-foreground lg:fs-18">{block.text}</p>;
  }
  if (block.type === "ul") {
    return (
      <ul className="flex flex-col gap-2.5">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3 fs-17 leading-[1.8] text-pretty text-foreground lg:fs-18">
            <span aria-hidden="true" className="mt-[0.8em] size-1.5 flex-none rounded-full bg-clay" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="overflow-hidden rounded-[0.5rem] border border-border bg-card">
      <table className="w-full border-collapse text-right">
        <tbody>
          {block.rows.map(([label, value]) => (
            <tr key={label} className="border-b border-border last:border-b-0">
              <th scope="row" className="w-[58%] px-4 py-3.5 align-top fs-16 leading-[1.6] font-semibold text-foreground lg:px-6 lg:fs-17">
                {label}
              </th>
              <td className="px-4 py-3.5 align-top fs-16 leading-[1.6] text-foreground lg:px-6 lg:fs-17">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Table of contents: a list of anchors. The sections have scroll-mt, so the sticky header never covers a heading. */
function Contents({ doc }: { doc: LegalDoc }) {
  return (
    <ol className="flex flex-col gap-2">
      {doc.sections.map((section, i) => (
        <li key={section.id}>
          <a href={`#${section.id}`} className="flex gap-2.5 fs-16 leading-[1.5] text-foreground transition-colors duration-160 ease-standard hover:text-clay">
            <span className="w-6 flex-none text-foreground/60" dir="ltr">
              {i + 1}.
            </span>
            <span>{section.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/** One legal page: heading, a table of contents beside the text, the sections, and the contact details. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const others = LEGAL_DOCS.filter((d) => d.path !== doc.path);

  return (
    <>
      <section className="border-b border-border">
        <Container className="pt-6 pb-9 text-right lg:pt-8 lg:pb-12">
          <nav aria-label="פירורי לחם" className="flex flex-wrap items-center gap-2 fs-14 text-foreground lg:fs-15">
            <Link to="/" className="transition-colors duration-160 ease-standard hover:text-clay">
              בית
            </Link>
            <Icon name="AngleLeft" size={11} />
            <span aria-current="page" className="font-medium">
              {doc.name}
            </span>
          </nav>
          <Pill className="mt-5 tracking-[0.16em]">מידע משפטי</Pill>
          <h1 className="mt-4 fs-36 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:fs-62">{doc.title}</h1>
          <p className="mt-4 max-w-[64ch] fs-18 leading-[1.7] text-foreground lg:fs-20">{doc.intro}</p>
          <p className="mt-4 fs-15 text-foreground/70">עודכן לאחרונה: {LEGAL_UPDATED}</p>
        </Container>
      </section>

      <section className="pt-8 pb-16 lg:pt-12 lg:pb-26">
        <Container className="lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start lg:gap-14">
          {/* Mobile: the contents fold away. Desktop: they stay beside the text while it scrolls. */}
          <details className="mb-8 rounded-[0.5rem] border border-border bg-card lg:hidden">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 fs-17 font-semibold text-foreground">
              <span>תוכן העניינים</span>
              <Icon name="AngleDown" size={14} />
            </summary>
            <div className="border-t border-border px-5 py-4">
              <Contents doc={doc} />
            </div>
          </details>
          <aside
            aria-label="תוכן העניינים"
            className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7.5rem)] lg:overflow-y-auto lg:rounded-lg lg:border lg:border-border lg:bg-card lg:p-6 lg:[scrollbar-width:thin]"
          >
            <p className="mb-4 fs-17 font-semibold text-foreground">תוכן העניינים</p>
            <Contents doc={doc} />
          </aside>

          <article className="max-w-[78ch] text-right">
            {doc.sections.map((section, i) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 border-t border-border pt-8 pb-8 first:border-t-0 first:pt-0 lg:scroll-mt-28">
                <h2 className="fs-24 leading-[1.25] font-bold tracking-[-0.01em] text-foreground lg:fs-30">
                  <span className="text-foreground/50" dir="ltr">
                    {i + 1}.{" "}
                  </span>
                  {section.title}
                </h2>
                <div className="mt-4 flex flex-col gap-4">
                  {section.blocks.map((block, j) => (
                    <Block key={j} block={block} />
                  ))}
                </div>
              </section>
            ))}

            <section className="mt-4 rounded-lg border border-border bg-card px-6 py-7 lg:px-8 lg:py-8">
              <h2 className="fs-22 font-bold text-foreground lg:fs-26">יצירת קשר</h2>
              <p className="mt-2 fs-16 leading-[1.7] text-foreground lg:fs-17">שאלה על המסמך הזה, על הזמנה או על ההתקנה? נשמח לעזור.</p>
              <dl className="mt-4 grid gap-x-8 gap-y-2.5 fs-16 text-foreground lg:grid-cols-[auto_1fr] lg:fs-17">
                <dt className="font-semibold">טלפון</dt>
                <dd dir="ltr" className="text-right">
                  <a href={`tel:${CONTACT.phone.replace(/\D/g, "")}`} className="transition-colors duration-160 ease-standard hover:text-clay">
                    {CONTACT.phone}
                  </a>
                </dd>
                <dt className="font-semibold">דואר אלקטרוני</dt>
                <dd dir="ltr" className="text-right">
                  <a href={`mailto:${CONTACT.email}`} className="transition-colors duration-160 ease-standard hover:text-clay">
                    {CONTACT.email}
                  </a>
                </dd>
                <dt className="font-semibold">שעות מענה</dt>
                <dd>{CONTACT.hours}</dd>
              </dl>
            </section>

            <nav aria-label="מסמכים נוספים" className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 fs-16">
              <span className="font-semibold text-foreground">מסמכים נוספים:</span>
              {others.map((d) => (
                <Link key={d.path} to={d.path} className="border-b border-primary pb-0.5 font-medium text-foreground transition-colors duration-160 ease-standard hover:text-clay">
                  {d.name}
                </Link>
              ))}
              <Link to="/שאלות-נפוצות" className="border-b border-primary pb-0.5 font-medium text-foreground transition-colors duration-160 ease-standard hover:text-clay">
                שאלות נפוצות
              </Link>
            </nav>
          </article>
        </Container>
      </section>
    </>
  );
}
