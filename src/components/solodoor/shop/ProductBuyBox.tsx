import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { cart, type CartLine } from "./cart";
import { DOOR_SIZE_TEXT, catalogImage, formatPrice, type Addon, type Application, type ProductData, type ProductVariant } from "./catalog";

interface ProductBuyBoxProps {
  data: ProductData;
  /** The selected surface tab (wallpapers only). */
  application: Application | null;
  /** Photo used for the cart line. */
  image: string | null;
  variant: ProductVariant | null;
  onVariant: (variant: ProductVariant) => void;
}

function Stepper({ value, min, step, onChange, label }: { value: number; min: number; step: number; onChange: (v: number) => void; label: string }) {
  const button =
    "flex size-11 flex-none cursor-pointer items-center justify-center text-foreground disabled:cursor-default disabled:opacity-35";
  return (
    <div className="inline-flex items-center rounded-md border border-input bg-card" role="group" aria-label={label}>
      <button type="button" className={button} aria-label="פחות" disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}>
        <Icon name="Minus" size={14} />
      </button>
      <span dir="ltr" className="w-10 text-center fs-18 font-semibold text-foreground" aria-live="polite">
        {value}
      </span>
      <button type="button" className={button} aria-label="עוד" onClick={() => onChange(value + step)}>
        <Icon name="Plus" size={14} />
      </button>
    </div>
  );
}

/** A tick-box row with a price, used for the installation service and the DIY tools. */
function CheckRow({ checked, onChange, title, text, price, image }: { checked: boolean; onChange: (v: boolean) => void; title: string; text?: string | null; price: string; image?: string | null }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3.5 rounded-md border bg-card px-3.5 py-3 transition-colors duration-160 ease-standard",
        checked ? "border-secondary" : "border-input hover:border-foreground",
      )}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-6 flex-none items-center justify-center rounded-[0.3125rem] border",
          checked ? "border-secondary bg-secondary text-secondary-foreground" : "border-input bg-card text-transparent",
        )}
      >
        <Icon name="Check" size={14} />
      </span>
      {image && (
        <span className="relative size-12 flex-none overflow-hidden rounded-[0.3125rem] bg-muted">
          <img src={image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
        </span>
      )}
      <span className="flex min-w-0 flex-auto flex-col text-right">
        <span className="fs-16 leading-[1.35] font-semibold text-foreground">{title}</span>
        {text && <span className="fs-14 leading-[1.5] text-foreground">{text}</span>}
      </span>
      <span className="flex-none fs-16 font-bold text-foreground">{price}</span>
    </label>
  );
}

const sectionTitle = "fs-16 font-semibold text-foreground lg:fs-17";

/** Price, options, add-ons and the three calls to action. */
export function ProductBuyBox({ data, application, image, variant, onVariant }: ProductBuyBoxProps) {
  const { product, addons, rugSizes, variants } = data;
  const isWallpaper = product.product_type === "wallpaper";
  const isRug = product.product_type === "pvc_rug";
  const onDoor = product.product_type === "designed_door" || application?.slug === "door";

  const min = application?.min_quantity ?? 1;
  const step = application?.quantity_step ?? 1;
  const [qty, setQty] = useState(min);
  const [sizeKey, setSizeKey] = useState(rugSizes[0]?.size_key ?? "");
  const [strips, setStrips] = useState<string | null>(null);
  const [doorNumber, setDoorNumber] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [installation, setInstallation] = useState(false);
  const [added, setAdded] = useState(false);

  const size = rugSizes.find((s) => s.size_key === sizeKey) ?? null;
  const pa = data.productApplications.find((p) => p.application_slug === application?.slug);
  const unitPrice = isRug
    ? (size?.price ?? product.base_price)
    : isWallpaper
      ? (pa?.price_override ?? application?.unit_price ?? product.base_price)
      : (variant?.price ?? product.base_price);
  const perSide = !isRug && (product.product_type === "designed_door" || application?.sell_unit === "side");
  const unitLabel = isRug ? "לשטיח" : perSide ? "לצד אחד של דלת" : "למטר";
  const qtyLabel = isRug ? "כמות" : perSide ? "כמה צדדים?" : "כמה מטרים?";

  const applies = (addon: Addon) => addon.applies_to.includes("all") || (application ? addon.applies_to.includes(application.slug) : false);
  const stripOptions = onDoor && isWallpaper ? addons.filter((a) => a.addon_type === "door_strips") : [];
  const numberAddons = onDoor ? addons.filter((a) => a.addon_type === "door_number") : [];
  // Installation is offered only on the surfaces listed in the add-on (doors). Designed doors have no tab, so their type is the key.
  const surfaceKey = application?.slug ?? product.product_type;
  const installAddon = product.installation_available
    ? addons.find((a) => a.addon_type === "service" && (a.applies_to.includes("all") || a.applies_to.includes(surfaceKey)))
    : undefined;
  const sampleAddon = product.sample_available ? addons.find((a) => a.addon_type === "sample") : undefined;
  const toolAddons = isRug
    ? []
    : addons.filter((a) => a.addon_type === "diy_tool" && (isWallpaper ? application?.recommended_addons.includes(a.slug) && applies(a) : a.applies_to.includes("all")));

  const digits = doorNumber.replace(/\D/g, "").split("");
  const stripAddon = stripOptions.find((a) => a.slug === strips);
  const digitPrice = numberAddons[0]?.price ?? 0;

  const extras =
    (stripAddon ? stripAddon.price * qty : 0) +
    (numberAddons.length ? digits.length * digitPrice : 0) +
    toolAddons.filter((t) => tools.includes(t.slug)).reduce((sum, t) => sum + t.price, 0) +
    (installation && installAddon ? installAddon.price : 0);
  const total = unitPrice * qty + extras;

  const productTitle = isWallpaper ? `טפט ${product.title}` : product.title;

  function lines(): CartLine[] {
    const result: CartLine[] = [
      {
        id: [product.handle, application?.slug, variant?.variant_key, size?.size_key].filter(Boolean).join(":"),
        title: productTitle,
        note: [application && `ל${application.label}`, variant?.title, size && `${size.width_cm}×${size.length_cm} ס"מ`, unitLabel]
          .filter(Boolean)
          .join(", "),
        image,
        price: unitPrice,
        qty,
      },
    ];
    if (stripAddon) {
      result.push({ id: `${product.handle}:${stripAddon.slug}`, title: `פסי ניקל: ${stripAddon.title}`, note: productTitle, image: catalogImage(stripAddon.image_path), price: stripAddon.price, qty });
    }
    for (const digit of new Set(digits)) {
      const addon = numberAddons.find((a) => a.slug === `door-number-${digit}`);
      if (addon) {
        result.push({ id: addon.slug, title: addon.title, image: catalogImage(addon.image_path), price: addon.price, qty: digits.filter((d) => d === digit).length });
      }
    }
    for (const tool of toolAddons.filter((t) => tools.includes(t.slug))) {
      result.push({ id: tool.slug, title: tool.title, image: catalogImage(tool.image_path), price: tool.price, qty: 1 });
    }
    if (installation && installAddon) {
      result.push({ id: installAddon.slug, title: installAddon.title, note: "תוספת להזמנה", image: null, price: installAddon.price, qty: 1, single: true });
    }
    return result;
  }

  function addToCart(open: boolean) {
    cart.add(lines(), { open });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2400);
  }

  return (
    <div className="flex flex-col gap-6 text-right">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="fs-34 leading-none font-bold text-foreground lg:fs-40">{formatPrice(unitPrice)}</span>
        <span className="fs-17 font-medium text-foreground lg:fs-18">{unitLabel}</span>
        <span className="w-full fs-15 text-foreground">המחיר לחומר בלבד, כולל מע"מ.</span>
      </div>

      {variants.length > 1 && (
        <div className="flex flex-col gap-2.5">
          <span className={sectionTitle}>
            גוון: <span className="font-normal">{variant?.title}</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.variant_key}
                type="button"
                onClick={() => onVariant(v)}
                aria-label={v.title}
                aria-pressed={v.variant_key === variant?.variant_key}
                className={cn(
                  "relative size-16 cursor-pointer overflow-hidden rounded-md border bg-muted transition-colors duration-160 ease-standard",
                  v.variant_key === variant?.variant_key ? "border-foreground shadow-swatch" : "border-input hover:border-foreground",
                )}
              >
                <img src={catalogImage(v.image_path) ?? ""} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {isRug && rugSizes.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className={sectionTitle}>מידה (ס"מ)</span>
          <div className="flex flex-wrap gap-2">
            {rugSizes.map((s) => (
              <button
                key={s.size_key}
                type="button"
                dir="ltr"
                onClick={() => setSizeKey(s.size_key)}
                aria-pressed={s.size_key === sizeKey}
                className={cn(
                  "cursor-pointer rounded-md border px-3.5 py-2 fs-15 font-medium transition-colors duration-160 ease-standard",
                  s.size_key === sizeKey ? "border-secondary bg-secondary text-secondary-foreground" : "border-input bg-card text-foreground hover:border-foreground",
                )}
              >
                {s.width_cm}×{s.length_cm}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <span className={sectionTitle}>{qtyLabel}</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Stepper value={qty} min={min} step={step} onChange={setQty} label={qtyLabel} />
          {(perSide || (isWallpaper && application)) && (
            <span className="max-w-[34ch] fs-15 leading-[1.5] text-foreground">
              {perSide
                ? `יחידה אחת מכסה צד אחד של דלת, ${DOOR_SIZE_TEXT}.`
                : `רוחב הגליל ${application?.roll_width_cm} ס"מ. מינימום הזמנה ${min} מטר.`}
            </span>
          )}
        </div>
        {isWallpaper && application?.measuring_tip && (
          <span className="flex items-start gap-2 fs-15 leading-[1.6] text-foreground">
            <span className="mt-0.5 inline-flex text-clay">
              <Icon name="InfoCircle" size={16} />
            </span>
            {application.measuring_tip}
          </span>
        )}
      </div>

      {stripOptions.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className={sectionTitle}>
            פסי ניקל לדלת <span className="font-normal">(תוספת {formatPrice(stripOptions[0].price)} לצד)</span>
          </span>
          <div className="grid grid-cols-4 gap-2 lg:grid-cols-6">
            <button
              type="button"
              onClick={() => setStrips(null)}
              aria-pressed={strips === null}
              className={cn(
                "flex aspect-[3/4] cursor-pointer items-center justify-center rounded-md border bg-card px-1 text-center fs-13 leading-[1.3] font-medium text-foreground transition-colors duration-160 ease-standard",
                strips === null ? "border-foreground shadow-swatch" : "border-input hover:border-foreground",
              )}
            >
              בלי פסים
            </button>
            {stripOptions.map((option) => (
              <button
                key={option.slug}
                type="button"
                title={option.title}
                aria-label={option.title}
                aria-pressed={strips === option.slug}
                onClick={() => setStrips(option.slug)}
                className={cn(
                  "relative aspect-[3/4] cursor-pointer overflow-hidden rounded-md border bg-muted transition-colors duration-160 ease-standard",
                  strips === option.slug ? "border-foreground shadow-swatch" : "border-input hover:border-foreground",
                )}
              >
                <img src={catalogImage(option.image_path) ?? ""} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
              </button>
            ))}
          </div>
          {stripAddon && <span className="fs-15 text-foreground">נבחר: {stripAddon.title}</span>}
        </div>
      )}

      {numberAddons.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <label htmlFor="door-number" className={sectionTitle}>
            מספר לדלת <span className="font-normal">({formatPrice(digitPrice)} לספרה)</span>
          </label>
          <div className="flex items-center gap-3">
            <Input
              id="door-number"
              dir="ltr"
              inputMode="numeric"
              maxLength={4}
              value={doorNumber}
              onChange={(e) => setDoorNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="12"
              className="w-28 bg-card text-center fs-18"
            />
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {digits.map((digit, i) => {
                const src = catalogImage(numberAddons.find((a) => a.slug === `door-number-${digit}`)?.image_path);
                return src ? <img key={i} src={src} alt="" className="size-11 rounded-[0.3125rem] border border-border object-cover" /> : null;
              })}
            </div>
          </div>
          <span className="fs-15 text-foreground">הקלידו את מספר הדירה, ונוסיף ספרות מתכת לדלת.</span>
        </div>
      )}

      {installAddon && (
        <div className="flex flex-col gap-2.5">
          <span className={sectionTitle}>התקנה</span>
          <CheckRow
            checked={installation}
            onChange={setInstallation}
            title="אני רוצה התקנה מקצועית"
            text="מתקין של סולודור מגיע אליכם. תוספת קבועה להזמנה."
            price={`+${formatPrice(installAddon.price)}`}
          />
        </div>
      )}

      {toolAddons.length > 0 && !installation && (
        <div className="flex flex-col gap-2.5">
          <span className={sectionTitle}>מה צריך כדי להדביק לבד</span>
          <div className="flex flex-col gap-2">
            {toolAddons.map((tool) => (
              <CheckRow
                key={tool.slug}
                checked={tools.includes(tool.slug)}
                onChange={(on) => setTools((current) => (on ? [...current, tool.slug] : current.filter((s) => s !== tool.slug)))}
                title={tool.title}
                text={tool.description}
                price={`+${formatPrice(tool.price)}`}
                image={catalogImage(tool.image_path)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-5">
        <div className="flex items-baseline justify-between">
          <span className="fs-18 font-semibold text-foreground">סה"כ</span>
          <span className="fs-28 leading-none font-bold text-foreground" aria-live="polite">
            {formatPrice(total)}
          </span>
        </div>
        <Button type="button" onClick={() => addToCart(false)} className="w-full py-4">
          <span>{added ? "נוסף לסל" : "הוספה לסל"}</span>
          <Icon name={added ? "Check" : "ShoppingCart"} size={18} />
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" onClick={() => addToCart(true)} className="px-3 py-3.5 fs-16">
            <span>רכישה מהירה</span>
            <Icon name="ArrowLeft" size={16} />
          </Button>
          <Button asChild variant="outline" className="px-3 py-3.5 fs-16">
            <a href="#">
              <span>התייעצות בווצאפ</span>
              <Icon name="ChatDots" size={17} />
            </a>
          </Button>
        </div>
        {sampleAddon && (
          <button
            type="button"
            onClick={() =>
              cart.add(
                [{ id: `sample:${product.handle}`, title: `דוגמית: ${productTitle}`, note: sampleAddon.price ? undefined : "חינם", image: catalogImage(data.images.find((i) => i.kind === "swatch")?.image_path), price: sampleAddon.price, qty: 1, single: true }],
                { open: true },
              )
            }
            className="cursor-pointer self-start border-b border-primary pb-0.5 fs-16 font-medium text-foreground"
          >
            לא בטוחים בגוון? הזמינו דוגמית לבית{sampleAddon.price ? ` (${formatPrice(sampleAddon.price)})` : ", חינם"}
          </button>
        )}
      </div>
    </div>
  );
}
