import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { DragRow } from "../DragRow";
import { Icon } from "../Icon";
import { Reviews } from "../Reviews";
import { ICON_DATA, type IconName } from "../icon-data";
import { Container, CoverImage, Pill } from "../primitives";
import { ProductBuyBox } from "./ProductBuyBox";
import { YouTubePlayer } from "./YouTubePlayer";
import { ShopCard } from "./ShopCard";
import { DEFAULT_APPLICATION, DOOR_SIZE_TEXT, catalogImage, type Application, type FaqItem, type ProductData, type ProductVariant } from "./catalog";

interface GalleryImage {
  src: string;
  alt: string;
  /** Set on the photo of a surface (door, fridge, ...): picking it switches the page to that surface's tab. */
  application?: string;
}

/** The surface tab for this product, or null for products without tabs (designed doors, rugs). */
export function currentApplication(data: ProductData, tab: string | undefined): Application | null {
  if (data.product.product_type !== "wallpaper") return null;
  const offered = data.applications.filter((a) => data.productApplications.some((pa) => pa.application_slug === a.slug));
  return offered.find((a) => a.slug === tab) ?? offered.find((a) => a.slug === DEFAULT_APPLICATION) ?? offered[0] ?? null;
}

/** H1 and page title, e.g. "טפט אפור בהיר לדלת". */
export function productHeading(data: ProductData, application: Application | null) {
  const { product } = data;
  if (product.product_type === "wallpaper") return `טפט ${product.title}` + (application ? ` ל${application.label}` : "");
  if (product.product_type === "designed_door") return `טפט מעוצב לדלת, דגם ${product.title}`;
  return product.title;
}

/** The FAQ set of the current category. */
export function productFaqs(data: ProductData, application: Application | null): FaqItem[] {
  const scope = application?.slug ?? data.product.product_type;
  return data.faqs.filter((f) => f.product_scopes.includes(scope));
}

function galleryImages(data: ProductData, application: Application | null, variant: ProductVariant | null): GalleryImage[] {
  const { product } = data;
  const list: GalleryImage[] = [];
  const push = (path: string | null | undefined, alt: string, applicationSlug?: string) => {
    const src = catalogImage(path);
    if (src && !list.some((i) => i.src === src)) list.push({ src, alt, application: applicationSlug });
  };
  if (product.product_type === "wallpaper") {
    // The surfaces keep a fixed order, so the thumbnails do not move when the tab changes; the swatch and roll follow.
    for (const a of data.applications) {
      const pa = data.productApplications.find((p) => p.application_slug === a.slug);
      push(pa?.image_path, pa?.image_alt ?? product.title, a.slug);
    }
    for (const image of data.images) push(image.image_path, image.alt ?? product.title);
  } else if (product.product_type === "designed_door") {
    push(variant?.image_path, `טפט מעוצב לדלת, ${variant?.title ?? product.title}`);
    for (const v of data.variants) push(v.image_path, `טפט מעוצב לדלת, ${v.title}`);
  } else {
    for (const image of data.images) push(image.image_path, image.alt ?? product.title);
  }
  return list;
}

/**
 * Main photo and thumbnails. Thumbnails of a surface work like the tabs above the gallery: they open that surface's
 * tab (its price, text and questions). The swatch and roll photos only change the main photo.
 */
function Gallery({
  images,
  activeApplication,
  onPickApplication,
}: {
  images: GalleryImage[];
  activeApplication?: string;
  onPickApplication: (slug: string) => void;
}) {
  const [index, setIndex] = useState(() => Math.max(0, images.findIndex((i) => i.application && i.application === activeApplication)));
  const main = images[Math.min(index, images.length - 1)];
  if (!main) return <div className="aspect-square rounded-lg bg-muted" />;
  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-24">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
        <CoverImage src={main.src} alt={main.alt} fetchPriority="high" />
      </div>
      {images.length > 1 && (
        <DragRow className="-mx-5 flex gap-2 overflow-x-auto px-5 scrollbar-none lg:mx-0 lg:grid lg:grid-cols-7 lg:gap-2.5 lg:overflow-visible lg:px-0">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => {
                setIndex(i);
                if (image.application && image.application !== activeApplication) onPickApplication(image.application);
              }}
              aria-label={image.alt}
              aria-pressed={i === index}
              className={cn(
                "relative aspect-square w-16 flex-none cursor-pointer overflow-hidden rounded-md border bg-muted transition-colors duration-160 ease-standard lg:w-auto",
                i === index ? "border-foreground" : "border-border hover:border-foreground",
              )}
            >
              <img src={image.src} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
            </button>
          ))}
        </DragRow>
      )}
    </div>
  );
}

function Paragraphs({ text, className }: { text: string | null; className?: string }) {
  if (!text) return null;
  return (
    <>
      {text.split(/\n{2,}/).map((paragraph) => (
        <p key={paragraph} className={className}>
          {paragraph}
        </p>
      ))}
    </>
  );
}

/** Description, specification, shipping and returns. Every panel stays in the page HTML; only one is shown. */
function Details({ data, application }: { data: ProductData; application: Application | null }) {
  const { product } = data;
  const [open, setOpen] = useState("description");
  const surfaceKey = application?.slug ?? product.product_type;
  const installOffered =
    product.installation_available &&
    data.addons.some((a) => a.addon_type === "service" && (a.applies_to.includes("all") || a.applies_to.includes(surfaceKey)));

  const specs: [string, string | null][] = [
    ["סגנון", product.style_family],
    ["גימור", product.finish],
    ["חומר", product.material],
    ["רוחב הגליל", product.roll_width_cm ? `${product.roll_width_cm} ס"מ` : null],
    ["עובי", product.thickness_mm ? `${product.thickness_mm} מ"מ` : null],
    ["מידות הדלת", product.product_type === "designed_door" || application?.sell_unit === "side" ? `${DOOR_SIZE_TEXT} (לצד אחד של דלת)` : null],
    ["נמכר לפי", product.product_type === "pvc_rug" ? "מידה" : application?.sell_unit === "meter" ? "מטר" : "צד של דלת"],
    ["התקנה", installOffered ? "עצמית, או מתקין בתוספת תשלום" : product.product_type === "pvc_rug" ? "אין צורך בהתקנה" : "עצמית"],
  ];
  const panels = [
    { key: "description", title: "תיאור" },
    { key: "specs", title: "מפרט טכני" },
    ...data.infoTabs.map((t) => ({ key: t.slug, title: t.title })),
  ];
  const body = "fs-17 leading-[1.85] text-pretty text-foreground lg:fs-18";

  return (
    <section data-reveal className="pt-14 pb-4 lg:pt-22 lg:pb-6">
      <Container>
        <DragRow role="tablist" className="-mx-5 flex gap-2 overflow-x-auto border-b border-border px-5 scrollbar-none lg:mx-0 lg:gap-3 lg:px-0">
          {panels.map((panel) => (
            <button
              key={panel.key}
              type="button"
              role="tab"
              aria-selected={open === panel.key}
              onClick={() => setOpen(panel.key)}
              className={cn(
                "-mb-px cursor-pointer border-b-2 px-3 py-3 fs-17 font-semibold whitespace-nowrap transition-colors duration-160 ease-standard lg:px-5 lg:fs-18",
                open === panel.key ? "border-primary text-foreground" : "border-transparent text-foreground hover:border-foreground",
              )}
            >
              {panel.title}
            </button>
          ))}
        </DragRow>

        <div className="max-w-[78ch] pt-7 text-right lg:pt-9">
          <div role="tabpanel" hidden={open !== "description"} className="flex flex-col gap-4">
            <h2 className="fs-26 leading-[1.15] font-bold tracking-[-0.02em] text-foreground lg:fs-34">
              {product.product_type === "wallpaper" ? `על טפט ${product.title}` : `על ${product.title}`}
            </h2>
            <Paragraphs text={product.long_description} className={body} />
            {application && (
              <>
                <h3 className="mt-3 fs-22 leading-[1.2] font-bold text-foreground lg:fs-26">הדבקה על {application.label}</h3>
                <Paragraphs text={application.long_description} className={body} />
              </>
            )}
          </div>

          <div role="tabpanel" hidden={open !== "specs"}>
            <h2 className="sr-only">מפרט טכני</h2>
            <dl className="grid grid-cols-1 border-t border-border lg:grid-cols-2 lg:gap-x-12">
              {specs
                .filter((spec): spec is [string, string] => Boolean(spec[1]))
                .map(([name, value]) => (
                  <div key={name} className="flex items-baseline justify-between gap-6 border-b border-border py-3.5">
                    <dt className="fs-16 font-semibold text-foreground lg:fs-17">{name}</dt>
                    <dd className="text-left fs-16 text-foreground lg:fs-17">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>

          {data.infoTabs.map((tab) => (
            <div key={tab.slug} role="tabpanel" hidden={open !== tab.slug} className="flex flex-col gap-4">
              <h2 className="sr-only">{tab.title}</h2>
              <Paragraphs text={tab.body} className={body} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Benefits({ data }: { data: ProductData }) {
  if (!data.benefits.length) return null;
  return (
    <section data-reveal className="pt-12 lg:pt-18">
      <Container>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-7 rounded-lg border border-border bg-card px-4 py-7 lg:grid-cols-6 lg:gap-x-6 lg:px-8 lg:py-9">
          {data.benefits.map((benefit) => (
            <li key={benefit.title} className="flex flex-col items-center gap-2 text-center">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted text-clay">
                <Icon name={(benefit.icon in ICON_DATA ? benefit.icon : "Check") as IconName} size={22} />
              </span>
              <span className="fs-16 leading-[1.3] font-semibold text-foreground">{benefit.title}</span>
              {benefit.text && <span className="fs-14 leading-[1.5] text-foreground">{benefit.text}</span>}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** The id of a YouTube video from a watch, shorts, embed or youtu.be link; null for any other address. */
function youtubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

/**
 * A video card. A YouTube link opens a pop-up with the title, an upright player and a volume control under it;
 * the video starts when the pop-up opens and stops when it is closed. A file plays in the card.
 * Until a video exists the poster is shown with a "soon" tag.
 */
function VideoCard({ title, url, poster }: { title: string; url: string | null; poster: string | null }) {
  const id = url ? youtubeId(url) : null;
  // The videos are filmed upright, so the player is upright too; "#wide" at the end of a link asks for a wide one.
  const wide = !!url && url.includes("#wide");
  const vertical = !!url && url.includes("/shorts/");
  const card = "relative aspect-video overflow-hidden rounded-lg bg-foreground";

  if (!url) {
    return (
      <div className={card}>
        {poster && <CoverImage src={poster} alt="" loading="lazy" className="opacity-60" />}
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-background lg:p-7">
          <span className="fs-20 leading-[1.25] font-bold lg:fs-26">{title}</span>
          <span className="flex-none rounded-full bg-background px-3.5 py-1.5 fs-14 font-semibold text-foreground">בקרוב</span>
        </span>
      </div>
    );
  }
  if (!id) {
    return (
      <div className={card}>
        <video src={url} poster={poster ?? undefined} controls preload="none" className="absolute inset-0 size-full object-cover" />
      </div>
    );
  }
  return (
    <Dialog>
      <DialogTrigger
        aria-label={`${title}, פתיחת הסרטון`}
        className={cn(card, "group block w-full cursor-pointer p-0 text-right")}
      >
        {poster && <CoverImage src={poster} alt="" loading="lazy" className="opacity-55 transition-opacity duration-240 ease-standard group-hover:opacity-70" />}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-background text-foreground shadow-handle transition-transform duration-240 ease-standard group-hover:scale-108 lg:size-20">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7 translate-x-[0.1rem] lg:size-8" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z" />
            </svg>
          </span>
        </span>
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-background lg:p-7">
          <span className="fs-20 leading-[1.25] font-bold lg:fs-26">{title}</span>
          {vertical && <span className="flex-none rounded-full bg-background px-3.5 py-1.5 fs-14 font-semibold text-foreground">סרטון קצר</span>}
        </span>
      </DialogTrigger>
      <DialogContent
        overlayClassName="items-center justify-center p-2 lg:p-8"
        className={cn("flex max-h-[98dvh] w-full flex-col gap-3 overflow-y-auto rounded-[1rem] px-4 pt-4 pb-4 lg:px-6", wide ? "max-w-4xl" : "max-w-md")}
      >
        <div className="flex items-start justify-between gap-3">
          <DialogTitle className="pt-1.5 fs-20 leading-[1.3] font-bold text-foreground lg:fs-24">{title}</DialogTitle>
          <DialogClose
            aria-label="סגירה"
            className="flex size-[46px] flex-none cursor-pointer items-center justify-center rounded-full border-2 border-foreground bg-background text-foreground transition-colors duration-160 ease-standard hover:bg-primary active:bg-primary"
          >
            <Icon name="Times" size={22} />
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">נגן הסרטון. הסרטון מתחיל מעצמו, ואפשר לכוון את עוצמת הקול מתחתיו.</DialogDescription>
        {/* The player is built only while the pop-up is open, so closing it stops the video. */}
        <YouTubePlayer id={id} title={title} wide={wide} />
      </DialogContent>
    </Dialog>
  );
}

/** Installation and measuring videos of the selected surface. */
function Videos({ application }: { application: Application | null }) {
  if (!application) return null;
  const poster = catalogImage(application.video_poster_path);
  const videos = [
    { title: `איך להדביק טפט על ${application.label}`, url: application.install_video_url },
    { title: `איך מודדים ${application.label} לפני הזמנת חומר`, url: application.measure_video_url },
  ];
  return (
    <section data-reveal className="pt-14 lg:pt-22">
      <Container>
        <div className="text-right">
          <Pill className="bg-secondary px-5 py-2 fs-16 text-secondary-foreground">מדביקים לבד</Pill>
          <h2 className="mt-4 fs-30 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-46">סרטוני הדרכה ומדידה</h2>
        </div>
        <div className="mt-7 grid grid-cols-1 gap-4 lg:mt-10 lg:grid-cols-2 lg:gap-6">
          {videos.map((video) => (
            <VideoCard key={video.title} title={video.title} url={video.url} poster={poster} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProductFaq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState(0);
  if (!items.length) return null;
  return (
    <section data-reveal className="pt-14 pb-4 lg:pt-22">
      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-18">
          <div className="text-right">
            <Pill className="tracking-[0.04em]">השאלות הנפוצות ביותר</Pill>
            <h2 className="mt-5 fs-36 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-52">שאלות נפוצות</h2>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={item.question}
                  className="overflow-hidden rounded-[0.75rem] border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground"
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      className="flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-right lg:px-7 lg:py-6"
                    >
                      <span className="flex-auto fs-18 leading-[1.4] font-semibold text-foreground">{item.question}</span>
                      <span className="inline-flex size-9 flex-none items-center justify-center rounded-full border border-foreground text-foreground">
                        <Icon name={isOpen ? "Minus" : "Plus"} size={16} />
                      </span>
                    </button>
                  </h3>
                  <div hidden={!isOpen} className="px-5 pb-6 text-right fs-18 leading-[1.8] text-foreground lg:px-7 lg:pb-7">
                    {item.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

/** The product page. `tab` comes from the URL, so every surface has its own address. */
export function ProductPage({ data, tab, variant: initialVariant }: { data: ProductData; tab: string | undefined; variant?: string }) {
  const { product } = data;
  const application = currentApplication(data, tab);
  const [variantKey, setVariantKey] = useState(data.variants.find((v) => v.variant_key === initialVariant)?.variant_key ?? data.variants[0]?.variant_key);
  const variant = data.variants.find((v) => v.variant_key === variantKey) ?? data.variants[0] ?? null;
  const images = galleryImages(data, application, variant);
  const heading = productHeading(data, application);
  const tabs = product.product_type === "wallpaper" ? data.applications.filter((a) => data.productApplications.some((pa) => pa.application_slug === a.slug)) : [];
  const shopSearch = { cat: application ? application.slug : product.product_type };
  const navigate = useNavigate();
  const openTab = (slug: string) =>
    navigate({
      to: "/product/$slug",
      params: { slug: product.slug },
      search: slug === DEFAULT_APPLICATION ? {} : { tab: slug },
      resetScroll: false,
    });

  return (
    <>
      <section>
        <Container className="pt-6 pb-2 lg:pt-8">
          <nav aria-label="פירורי לחם" className="flex flex-wrap items-center gap-2 fs-14 text-foreground lg:fs-15">
            <Link to="/" className="transition-colors duration-160 ease-standard hover:text-clay">
              בית
            </Link>
            <Icon name="AngleLeft" size={11} />
            <Link to="/חנות" search={shopSearch} className="transition-colors duration-160 ease-standard hover:text-clay">
              {application ? `טפטים ל${application.label}` : product.product_type === "designed_door" ? "טפטים מעוצבים לדלת" : "שטיחי PVC"}
            </Link>
            <Icon name="AngleLeft" size={11} />
            <span aria-current="page" className="font-medium">
              {product.product_type === "wallpaper" ? `טפט ${product.title}` : product.title}
            </span>
          </nav>

          {tabs.length > 1 && (
            <div className="mt-5">
              <span className="fs-15 font-semibold text-foreground lg:fs-16">על מה מדביקים?</span>
              <DragRow className="-mx-5 mt-2.5 flex gap-2 overflow-x-auto px-5 scrollbar-none lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
                {tabs.map((a) => (
                  <Link
                    key={a.slug}
                    to="/product/$slug"
                    params={{ slug: product.slug }}
                    search={a.slug === DEFAULT_APPLICATION ? {} : { tab: a.slug }}
                    resetScroll={false}
                    aria-current={a.slug === application?.slug ? "page" : undefined}
                    className={cn(
                      "rounded-full border px-5 py-2 fs-16 font-medium whitespace-nowrap transition-colors duration-160 ease-standard lg:px-6 lg:fs-17",
                      a.slug === application?.slug
                        ? "border-secondary bg-secondary text-secondary-foreground"
                        : "border-input bg-card text-foreground hover:border-foreground",
                    )}
                  >
                    {a.label}
                  </Link>
                ))}
              </DragRow>
            </div>
          )}
        </Container>

        <Container className="grid grid-cols-1 gap-8 pt-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:pt-7">
          <Gallery key={`${application?.slug}:${variant?.variant_key}`} images={images} activeApplication={application?.slug} onPickApplication={openTab} />

          <div className="flex flex-col gap-5 text-right">
            <div>
              <Pill className="tracking-[0.04em]">{product.style_family}</Pill>
              <h1 className="mt-4 fs-34 leading-[1.08] font-bold tracking-[-0.02em] text-foreground lg:fs-52">{heading}</h1>
              <p className="mt-4 fs-17 leading-[1.7] text-pretty text-foreground lg:fs-18">
                {application?.short_description ?? product.short_description}
              </p>
            </div>
            <ProductBuyBox
              key={application?.slug ?? product.handle}
              data={data}
              application={application}
              image={(images.find((i) => i.application && i.application === application?.slug) ?? images[0])?.src ?? null}
              variant={variant}
              onVariant={(v) => setVariantKey(v.variant_key)}
            />
          </div>
        </Container>
      </section>

      <Benefits data={data} />
      <Details data={data} application={application} />
      <Videos application={application} />
      <ProductFaq key={application?.slug} items={productFaqs(data, application)} />
      <Reviews />

      {data.related.length > 0 && (
        <section data-reveal className="pt-4 pb-16 lg:pb-26">
          <Container>
            <h2 className="text-center fs-30 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-46">
              עוד עיצובים שיכולים להתאים
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 lg:mt-12 lg:grid-cols-4 lg:gap-6">
              {data.related.map((item) => (
                <ShopCard key={item.handle} item={item} application={application ?? undefined} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
