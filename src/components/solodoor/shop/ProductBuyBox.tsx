import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { SAMPLE_EXTRA_PRICE, cart, type CartLine } from "./cart";
import { INSTALL_CITY_BAD, INSTALL_CITY_EMPTY, INSTALL_DAYS, checkInstallCity } from "./install-areas";
import { INSTALL_DESIGNED_BOTH_SIDES_EXTRA, INSTALL_ONE_SIDE_PRICE, INSTALL_SKU, splitSides } from "./install-pricing";
import { InstallCityField } from "./InstallCityField";
import { useLocalities } from "./localities";
import { TermsDialog } from "../legal/TermsDialog";

/** Metres are sold to the nearest ten centimetres. */
const METRE_PRECISION = 0.1;
import { DOOR_SIZE_TEXT, catalogImage, formatPrice, type Addon, type Application, type ProductData, type ProductVariant } from "./catalog";
import { WHATSAPP_MESSAGE, whatsappHref } from "../whatsapp";

interface ProductBuyBoxProps {
  data: ProductData;
  /** The selected surface tab (wallpapers only). */
  application: Application | null;
  /** Photo used for the cart line. */
  image: string | null;
  variant: ProductVariant | null;
  onVariant: (variant: ProductVariant) => void;
}

/**
 * Quantity with plus and minus. With `precision` (metres) the number can also be typed freely, 2.3 or 2.7,
 * and is settled to that precision and to the minimum when the field is left.
 */
function Stepper({ value, min, max, step, precision, onChange, label }: { value: number; min: number; max?: number; step: number; precision?: number; onChange: (v: number) => void; label: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  const button =
    "flex size-11 flex-none cursor-pointer items-center justify-center text-foreground disabled:cursor-default disabled:opacity-35";
  const snap = (n: number) => {
    const parts = precision ? Math.round(1 / precision) : 1;
    return Math.min(max ?? Infinity, Math.max(min, Math.round(n * parts) / parts));
  };
  const commit = () => {
    if (draft === null) return;
    const typed = parseFloat(draft.replace(",", "."));
    onChange(Number.isFinite(typed) ? snap(typed) : value);
    setDraft(null);
  };
  return (
    <div className="inline-flex items-center rounded-md border border-input bg-card" role="group" aria-label={label}>
      <button type="button" className={button} aria-label="פחות" disabled={value <= min} onClick={() => onChange(snap(value - step))}>
        <Icon name="Minus" size={14} />
      </button>
      {precision ? (
        <input
          dir="ltr"
          inputMode="decimal"
          aria-label={label}
          value={draft ?? String(value)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="w-14 bg-transparent text-center fs-18 font-semibold text-foreground focus:outline-none"
        />
      ) : (
        <span dir="ltr" className="min-w-12 px-1 text-center fs-18 font-semibold text-foreground" aria-live="polite">
          {value}
        </span>
      )}
      <button type="button" className={button} aria-label="עוד" disabled={max !== undefined && value >= max} onClick={() => onChange(snap(value + step))}>
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
  // How many doors get both sides covered; null follows the quantity (as many pairs as it holds).
  const [doubleChoice, setDoubleChoice] = useState<number | null>(null);
  const [installCity, setInstallCity] = useState("");
  const [cityTouched, setCityTouched] = useState(false);
  // "Add to cart" was pressed while the city was missing: the reason is then also written under the button.
  const [cityStopped, setCityStopped] = useState(false);
  const cityInput = useRef<HTMLInputElement>(null);
  const [added, setAdded] = useState(false);

  const size = rugSizes.find((s) => s.size_key === sizeKey) ?? null;
  const pa = data.productApplications.find((p) => p.application_slug === application?.slug);
  const unitPrice = isRug
    ? (size?.price ?? product.base_price)
    : isWallpaper
      ? (pa?.price_override ?? application?.unit_price ?? product.base_price)
      : (variant?.price ?? product.base_price);
  const perSide = !isRug && (product.product_type === "designed_door" || application?.sell_unit === "side");
  // Wallpaper by the metre is cut to any length: the customer may ask for 2.3 or 2.7 metres.
  const perMeter = !isRug && !perSide;
  const unitLabel = isRug ? "לשטיח" : perSide ? "לצד אחד של דלת" : "למטר";
  const qtyLabel = isRug ? "כמות" : perSide ? "כמה צדדים?" : "כמה מטרים?";

  const applies = (addon: Addon) => addon.applies_to.includes("all") || (application ? addon.applies_to.includes(application.slug) : false);
  const numberAddons = onDoor ? addons.filter((a) => a.addon_type === "door_number") : [];
  // Installation is offered only on the surfaces listed in the add-on (doors). Designed doors have no tab, so their type is the key.
  const surfaceKey = application?.slug ?? product.product_type;
  const installAddon = product.installation_available
    ? addons.find((a) => a.addon_type === "service" && (a.applies_to.includes("all") || a.applies_to.includes(surfaceKey)))
    : undefined;
  // Installation is priced per door: both sides of one door, or one side only. A designed door costs more on both sides.
  const isDesigned = product.product_type === "designed_door";
  const doublePrice = (installAddon?.price ?? 0) + (isDesigned ? INSTALL_DESIGNED_BOTH_SIDES_EXTRA : 0);
  const split = splitSides(qty, doubleChoice ?? Infinity);
  const installTotal = split.doubles * doublePrice + split.singles * INSTALL_ONE_SIDE_PRICE;
  // Strips on a door are put on by the installer, so nobody gluing it themselves would order them:
  // the choice appears only once professional installation is ticked.
  const allStrips = onDoor && isWallpaper ? addons.filter((a) => a.addon_type === "door_strips") : [];
  const stripOptions = installation && installAddon ? allStrips : [];
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
    (installation && installAddon ? installTotal : 0);
  const total = unitPrice * qty + extras;

  const productTitle = isWallpaper ? `טפט ${product.title}` : product.title;

  function lines(): CartLine[] {
    const mainId = [product.handle, application?.slug, variant?.variant_key, size?.size_key].filter(Boolean).join(":");
    const result: CartLine[] = [
      {
        id: mainId,
        title: productTitle,
        note: [application && `ל${application.label}`, variant?.title, size && `${size.width_cm}×${size.length_cm} ס"מ`, unitLabel]
          .filter(Boolean)
          .join(", "),
        image,
        price: unitPrice,
        qty,
        min: perMeter ? min : undefined,
      },
    ];
    if (installation && installAddon) {
      // The installation belongs to this covering: one line per kind of door, the quantity is the number of doors.
      const place = { note: productTitle, image: null, parent: mainId, city: installCity.trim(), cityOk: true };
      if (split.doubles) {
        result.push({ id: `${mainId}:install-double`, title: "התקנה: דלת עם שני צדדים", price: doublePrice, qty: split.doubles, install: "double", sku: isDesigned ? INSTALL_SKU.designedDouble : INSTALL_SKU.double, ...place });
      }
      if (split.singles) {
        result.push({ id: `${mainId}:install-single`, title: "התקנה: דלת עם צד אחד", price: INSTALL_ONE_SIDE_PRICE, qty: split.singles, install: "single", sku: INSTALL_SKU.single, ...place });
      }
    }
    if (stripAddon) {
      result.push({ id: `${product.handle}:${stripAddon.slug}`, title: `עיצוב פסים: ${stripAddon.title}`, note: productTitle, image: catalogImage(stripAddon.image_path), price: stripAddon.price, qty });
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
    return result;
  }

  // Installation only inside the service areas: the order does not go on without a city that is in one.
  const localities = useLocalities(installation);
  const cityStatus = checkInstallCity(localities, installCity);
  const installBlocked = installation && !!installAddon && cityStatus !== "ok";

  // The reason the order cannot go on, shown under the buttons as well as at the field.
  const cityStop = installBlocked && cityStopped ? (cityStatus === "bad" ? INSTALL_CITY_BAD : INSTALL_CITY_EMPTY) : null;

  function addToCart(open: boolean) {
    if (installBlocked) {
      setCityTouched(true);
      setCityStopped(true);
      // The city field may be far above the button: bring it back into view and put the cursor in it.
      cityInput.current?.focus({ preventScroll: true });
      cityInput.current?.scrollIntoView({ block: "center" });
      return;
    }
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
                  v.variant_key === variant?.variant_key ? "border-primary" : "border-input hover:border-foreground",
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
        <span className="fs-16 font-bold text-foreground lg:fs-17">{qtyLabel}</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Stepper
            value={qty}
            min={min}
            step={step}
            precision={perMeter ? METRE_PRECISION : undefined}
            onChange={(value) => {
              setQty(value);
              // Another number of sides is spread over the doors anew.
              setDoubleChoice(null);
            }}
            label={qtyLabel}
          />
          {(perSide || (isWallpaper && application)) && (
            <span className="max-w-[34ch] fs-15 leading-[1.5] text-foreground">
              {perSide
                ? `יחידה אחת מכסה צד אחד של דלת, ${DOOR_SIZE_TEXT}.`
                : `רוחב הגליל ${application?.roll_width_cm} ס"מ. מינימום הזמנה ${min} מטר. אפשר להקליד כל כמות, למשל 2.3 או 2.7 מטר.`}
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
              placeholder="לדוגמה 12"
              className="w-36 bg-card text-center fs-18 placeholder:opacity-45 focus:placeholder:opacity-0"
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
            text={`מתקין של סולודור מגיע אליכם עם החומר, בלי דמי משלוח. ${formatPrice(doublePrice)} לדלת סטנדרטית משני הצדדים, ${formatPrice(INSTALL_ONE_SIDE_PRICE)} לדלת מצד אחד. התקנה תוך עד ${INSTALL_DAYS} ימי עסקים.`}
            price={`+${formatPrice(installTotal)}`}
          />
          {/* With one or two sides there is nothing to split: one door, one side or both. */}
          {installation && qty >= 3 && (
            <div className="flex flex-col gap-4 rounded-md border border-border bg-muted p-4">
              <div className="flex flex-col gap-1">
                <span className="fs-16 leading-[1.35] font-semibold text-foreground">איך תרצו לחלק את ההתקנה?</span>
                <span className="fs-14 leading-[1.5] text-foreground">בחרו כמה דלתות יצופו משני הצדדים. יתר הצדדים יותקנו על דלתות נפרדות.</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 flex-col">
                  <span className="fs-16 leading-[1.35] font-semibold text-foreground">דלתות עם שני צדדים</span>
                  <span className="fs-14 leading-[1.5] text-foreground">{formatPrice(doublePrice)} להתקנת דלת</span>
                </span>
                <Stepper value={split.doubles} min={0} max={split.most} step={1} onChange={setDoubleChoice} label="דלתות עם שני צדדים" />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="flex min-w-0 flex-col">
                  <span className="fs-16 leading-[1.35] font-semibold text-foreground">דלתות עם צד אחד</span>
                  <span className="fs-14 leading-[1.5] text-foreground">{formatPrice(INSTALL_ONE_SIDE_PRICE)} להתקנת דלת</span>
                </span>
                <span dir="ltr" className="w-34 flex-none text-center fs-18 font-semibold text-foreground" aria-live="polite">
                  {split.singles}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-border pt-4">
                <span className="fs-16 font-semibold text-foreground">סה"כ התקנה</span>
                <span className="fs-22 leading-none font-bold text-foreground" aria-live="polite">
                  {formatPrice(installTotal)}
                </span>
              </div>
            </div>
          )}
          <TermsDialog section="installation">
            <button type="button" className="cursor-pointer self-start border-b border-primary fs-14 leading-[1.5] font-medium text-foreground">
              לתנאי ההתקנה המלאים בתקנון
            </button>
          </TermsDialog>
          {installation && (
            <InstallCityField
              value={installCity}
              onChange={setInstallCity}
              rows={localities}
              status={cityStatus}
              touched={cityTouched}
              onTouched={() => setCityTouched(true)}
              inputRef={cityInput}
            />
          )}
          {!installation && allStrips.length > 0 && (
            <span className="fs-14 leading-[1.5] text-foreground">בהתקנה על ידי סולודור אפשר להוסיף לדלת עיצוב פסים.</span>
          )}
        </div>
      )}

      {/* Only with installation: the installer puts the strips on. Every design has its own price. */}
      {installation && stripOptions.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className={sectionTitle}>
            עיצוב פסים לדלת <span className="font-normal">(לא חובה, המחיר לצד אחד של דלת)</span>
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setStrips(null)}
              aria-pressed={strips === null}
              className={cn(
                "col-span-full flex min-h-12 cursor-pointer items-center justify-center rounded-md border bg-card px-2 text-center fs-15 leading-[1.3] font-medium text-foreground transition-colors duration-160 ease-standard",
                strips === null ? "border-primary" : "border-input hover:border-foreground",
              )}
            >
              בלי פסים
            </button>
            {stripOptions.map((option) => {
              const src = catalogImage(option.image_path);
              return (
                <button
                  key={option.slug}
                  type="button"
                  aria-pressed={strips === option.slug}
                  onClick={() => setStrips(option.slug)}
                  className={cn(
                    "flex cursor-pointer flex-col overflow-hidden rounded-md border bg-card text-center transition-colors duration-160 ease-standard",
                    strips === option.slug ? "border-primary" : "border-input hover:border-foreground",
                  )}
                >
                  <span className="relative block aspect-[4/5] w-full overflow-hidden bg-muted">
                    {src ? (
                      <img src={src} alt={`דלת עם ${option.title}`} loading="lazy" className="absolute inset-0 size-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center px-3 fs-14 leading-[1.4] text-foreground">{option.title}</span>
                    )}
                  </span>
                  <span className="flex flex-col gap-0.5 px-2 py-2.5">
                    {src && <span className="fs-14 leading-[1.3] font-medium text-foreground">{option.title}</span>}
                    <span className="fs-14 font-bold text-foreground">+{formatPrice(option.price)}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {stripAddon && (
            <span className="fs-15 text-foreground">
              נבחר: {stripAddon.title}, +{formatPrice(stripAddon.price * qty)} {qty > 1 ? `ל${qty} צדדים` : "לצד אחד"}
            </span>
          )}
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
        {cityStop && (
          <span role="alert" className="rounded-md border border-destructive bg-destructive/8 px-3.5 py-3 fs-15 leading-[1.5] font-bold text-destructive">
            {cityStop}
          </span>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" onClick={() => addToCart(true)} className="px-3 py-3.5 fs-16">
            <span>רכישה מהירה</span>
            <Icon name="ArrowLeft" size={16} />
          </Button>
          <Button asChild variant="outline" className="px-3 py-3.5 fs-16">
            <a href={whatsappHref(`${WHATSAPP_MESSAGE}, אשמח להתייעץ לגבי ${productTitle}`)} target="_blank" rel="noopener noreferrer">
              <span>התייעצות בווצאפ</span>
              <Icon name="ChatDots" size={17} />
            </a>
          </Button>
        </div>
        {sampleAddon && (
          <div className="mt-1 flex flex-col gap-3 rounded-md border border-border bg-muted p-4 lg:p-5">
            <span className="fs-22 leading-[1.2] font-bold text-foreground lg:fs-24">לא בטוחים בגוון?</span>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                cart.add(
                  [{ id: `sample:${product.handle}`, title: `דוגמית: ${productTitle}`, note: sampleAddon.price ? undefined : "חינם", image: catalogImage(data.images.find((i) => i.kind === "swatch")?.image_path), price: sampleAddon.price, qty: 1, single: true }],
                  { open: true },
                )
              }
              className="w-full bg-card py-3.5 fs-16"
            >
              <span>הזמינו דוגמית לבית{sampleAddon.price ? ` (${formatPrice(sampleAddon.price)})` : ", חינם"}</span>
              <Icon name="ArrowLeft" size={16} />
            </Button>
            <span className="fs-14 leading-[1.5] text-foreground">
              דוגמית ראשונה בחינם, אתם משלמים רק על המשלוח. כל דוגמית נוספת ב{formatPrice(SAMPLE_EXTRA_PRICE)} בלבד (לא כולל משלוח).
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
