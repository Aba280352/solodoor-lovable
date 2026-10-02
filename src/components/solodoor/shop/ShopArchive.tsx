import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { Container, Pill } from "../primitives";
import { ShopCard } from "./ShopCard";
import { STYLE_FAMILIES, type ProductType, type ShopData } from "./catalog";

export interface ShopSearch {
  type?: ProductType;
  use?: string;
  style?: string;
}

const TYPES: { key: ProductType; label: string }[] = [
  { key: "wallpaper", label: "טפטים" },
  { key: "designed_door", label: "טפטים מעוצבים לדלת" },
  { key: "pvc_rug", label: "שטיחי PVC" },
];

/** Heading and intro for the current filter. Also used for the page title and description. */
export function shopHeading(search: ShopSearch, data: ShopData) {
  const application = data.applications.find((a) => a.slug === search.use);
  const style = STYLE_FAMILIES.find((s) => s.key === search.style);
  if (application) {
    return {
      title: `טפטים ל${application.label}` + (style ? `, ${style.label}` : ""),
      intro: application.short_description ?? "",
    };
  }
  if (style) {
    return {
      title: `טפטים, ${style.label}`,
      intro: "טפטים בהדבקה עצמית לדלתות, למטבחים, למקררים, לשיש, לקירות ולארונות חשמל.",
    };
  }
  if (search.type === "designed_door") {
    return {
      title: "טפטים מעוצבים לדלת",
      intro: "טפטים מודפסים לדלת עם דוגמאות, מסגרות ופסים ואפקט עומק תלת ממדי. המחיר לצד אחד של דלת.",
    };
  }
  if (search.type === "pvc_rug") {
    return {
      title: "שטיחי PVC מעוצבים",
      intro: "שטיחים דקים ועמידים שאינם סופגים נוזלים וקלים לניקוי, למטבח, לכניסה ולחדרי ילדים.",
    };
  }
  if (search.type === "wallpaper") {
    return {
      title: "טפטים בהדבקה עצמית",
      intro: "טפטים עבים ועמידים לדלתות, למטבחים, למקררים, לשיש, לקירות ולארונות חשמל, להתקנה עצמית או עם מתקין.",
    };
  }
  return {
    title: "החנות של סולודור",
    intro: "טפטים בהדבקה עצמית, טפטים מעוצבים לדלת ושטיחי PVC. בוחרים עיצוב, מזמינים באתר ומקבלים עד הבית.",
  };
}

function FilterLink({ search, active, children }: { search: ShopSearch; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to="/חנות"
      search={search}
      resetScroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-4 py-2 fs-15 font-medium whitespace-nowrap transition-colors duration-160 ease-standard lg:px-5 lg:fs-16",
        active
          ? "border-secondary bg-secondary text-secondary-foreground"
          : "border-input bg-card text-foreground hover:border-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-5">
      <span className="flex-none fs-15 font-semibold text-foreground lg:w-24 lg:fs-16">{label}</span>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 scrollbar-none lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
        {children}
      </div>
    </div>
  );
}

/** The shop archive: heading, filters and the product grid. */
export function ShopArchive({ data, search }: { data: ShopData; search: ShopSearch }) {
  const application = data.applications.find((a) => a.slug === search.use);
  const style = STYLE_FAMILIES.find((s) => s.key === search.style);
  // Surface and style only exist for wallpapers, so choosing one narrows the grid to them.
  const type: ProductType | undefined = application || style ? "wallpaper" : search.type;

  const items = data.items.filter(
    (item) =>
      (!type || item.product_type === type) &&
      (!style || item.style_family === style.label) &&
      (!application || Boolean(item.images[application.slug])),
  );
  const { title, intro } = shopHeading(search, data);
  const showWallpaperFilters = !type || type === "wallpaper";

  return (
    <>
      <section className="border-b border-border">
        <Container className="pt-6 pb-9 text-right lg:pt-8 lg:pb-12">
          <nav aria-label="פירורי לחם" className="flex items-center gap-2 fs-14 text-foreground lg:fs-15">
            <Link to="/" className="transition-colors duration-160 ease-standard hover:text-clay">
              בית
            </Link>
            <Icon name="AngleLeft" size={11} />
            {title === "החנות של סולודור" ? (
              <span aria-current="page" className="font-medium">
                חנות
              </span>
            ) : (
              <>
                <Link to="/חנות" className="transition-colors duration-160 ease-standard hover:text-clay">
                  חנות
                </Link>
                <Icon name="AngleLeft" size={11} />
                <span aria-current="page" className="font-medium">
                  {title}
                </span>
              </>
            )}
          </nav>

          <Pill className="mt-5 tracking-[0.16em]">החנות</Pill>
          <h1 className="mt-4 fs-36 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:fs-62">{title}</h1>
          <p className="mt-4 max-w-[62ch] fs-18 leading-[1.7] text-foreground lg:fs-20">{intro}</p>
        </Container>
      </section>

      <section className="pt-7 pb-16 lg:pt-10 lg:pb-26">
        <Container>
          <div className="flex flex-col gap-4 lg:gap-5">
            <FilterRow label="סוג מוצר">
              <FilterLink search={{}} active={!type}>
                הכל
              </FilterLink>
              {TYPES.map((t) => (
                <FilterLink key={t.key} search={{ type: t.key }} active={type === t.key}>
                  {t.label}
                </FilterLink>
              ))}
            </FilterRow>

            {showWallpaperFilters && (
              <>
                <FilterRow label="לפי שימוש">
                  {data.applications.map((a) => (
                    <FilterLink
                      key={a.slug}
                      search={{ use: a.slug, style: search.style }}
                      active={application?.slug === a.slug}
                    >
                      {a.label}
                    </FilterLink>
                  ))}
                </FilterRow>
                <FilterRow label="לפי סגנון">
                  {STYLE_FAMILIES.map((s) => (
                    <FilterLink key={s.key} search={{ use: search.use, style: s.key }} active={style?.key === s.key}>
                      {s.label}
                    </FilterLink>
                  ))}
                </FilterRow>
              </>
            )}
          </div>

          <p className="mt-7 fs-16 font-medium text-foreground lg:mt-9">{items.length} מוצרים</p>

          {items.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-5 lg:grid-cols-4 lg:gap-6">
              {items.map((item) => (
                <ShopCard key={item.handle} item={item} application={application} rugFromPrice={data.rugFromPrice} />
              ))}
            </div>
          ) : (
            <p className="mt-8 fs-18 text-foreground">לא נמצאו מוצרים בסינון הזה. נסו לבחור שימוש או סגנון אחר.</p>
          )}
        </Container>
      </section>
    </>
  );
}
