import { useState, type ChangeEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { ROLL_WIDTH_CM, WASTE_RATE } from "./data";
import { whatsappHref } from "./whatsapp";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-right">
      <span className="fs-16 font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

const toNumber = (value: string) => {
  const n = parseFloat(value.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Rounds up to the nearest half metre, which is how the material is cut. */
const roundUpHalf = (n: number) => Math.ceil(n * 2) / 2;

const formatMeters = (n: number, digits = 1) => n.toLocaleString("he-IL", { maximumFractionDigits: digits });

type Unit = "cm" | "m";
const units_: { value: Unit; label: string }[] = [
  { value: "cm", label: "ס\"מ" },
  { value: "m", label: "מטר" },
];

/**
 * "How much do I need?" The covered surface is cut into vertical strips of one
 * roll width, so the order length is strips × height × quantity (+ waste).
 */
export function QuantityCalculator({ className }: { className?: string }) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [qty, setQty] = useState("1");
  const [waste, setWaste] = useState(true);
  const [unit, setUnit] = useState<Unit>("cm");

  // Everything below works in centimetres, whatever the user typed.
  const toCm = unit === "m" ? 100 : 1;
  const unitLabel = unit === "m" ? "מטר" : "ס\"מ";
  const w = toNumber(width) * toCm;
  const h = toNumber(height) * toCm;
  const units = Math.max(1, Math.round(toNumber(qty)) || 1);

  const ready = w > 0 && h > 0;
  const strips = ready ? Math.ceil(w / ROLL_WIDTH_CM) * units : 0;
  const netMeters = (strips * h) / 100;
  const orderMeters = ready ? roundUpHalf(netMeters * (waste ? 1 + WASTE_RATE : 1)) : 0;

  const bind = (set: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => set(e.target.value);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="light" size="xl" className={cn("gap-3 py-5", className)}>
          <Icon name="Expand" size={18} />
          <span>מחשבון כמות</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        overlayClassName="items-center justify-center p-3 lg:p-8"
        className="w-full max-w-120 rounded-[1rem] px-5 pt-6 pb-7 lg:px-8"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="fs-28 font-bold tracking-[-0.02em] text-foreground lg:fs-32">
            מחשבון כמות
          </DialogTitle>
          <DialogClose aria-label="סגירה" className="inline-flex cursor-pointer items-center text-foreground">
            <Icon name="Times" size={24} />
          </DialogClose>
        </div>
        <DialogDescription className="mt-2 fs-16 leading-[1.6] text-foreground">
          מדדו את המשטח שרוצים לצפות והמחשבון יחשב כמה מטרים להזמין.
        </DialogDescription>

        <div className="mt-5 flex items-center gap-3">
          <span className="fs-16 font-medium text-foreground">יחידת מידה</span>
          <div className="flex overflow-hidden rounded-md border border-input">
            {units_.map((u) => (
              <button
                key={u.value}
                type="button"
                aria-pressed={unit === u.value}
                onClick={() => setUnit(u.value)}
                className={cn(
                  "cursor-pointer px-5 py-2 fs-16 font-medium text-foreground transition-colors duration-160 ease-standard",
                  unit === u.value && "bg-primary text-primary-foreground",
                )}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Field label={`רוחב (${unitLabel})`}>
            <Input inputMode="decimal" dir="ltr" value={width} onChange={bind(setWidth)} placeholder={unit === "m" ? "0.9" : "90"} className="fs-18" />
          </Field>
          <Field label={`גובה (${unitLabel})`}>
            <Input inputMode="decimal" dir="ltr" value={height} onChange={bind(setHeight)} placeholder={unit === "m" ? "2.1" : "210"} className="fs-18" />
          </Field>
          <div className="col-span-full">
            <Field label="כמות (דלתות / משטחים זהים)">
              <Input inputMode="numeric" dir="ltr" value={qty} onChange={bind(setQty)} className="fs-18" />
            </Field>
          </div>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-2.5 fs-16 text-foreground">
          <input
            type="checkbox"
            checked={waste}
            onChange={(e) => setWaste(e.target.checked)}
            className="m-0 size-4 cursor-pointer accent-primary"
          />
          <span>הוסיפו {Math.round(WASTE_RATE * 100)}% לחיתוכים ולטעויות</span>
        </label>

        <div className="mt-6 rounded-[0.5rem] border border-border bg-background px-5 py-5 text-center">
          {ready ? (
            <>
              <span className="block fs-15 font-semibold tracking-[0.16em] text-clay">מומלץ להזמין</span>
              <span className="mt-1 block fs-40 leading-[1.1] font-bold text-foreground">
                {formatMeters(orderMeters)} <span className="fs-20 font-medium">מטר אורך</span>
              </span>
              <span className="mt-2 block fs-15 leading-[1.6] text-foreground">
                {strips} {strips === 1 ? "פס" : "פסים"} ברוחב {ROLL_WIDTH_CM} ס"מ, {formatMeters(netMeters, 2)} מטר נטו
                {waste ? " + תוספת לחיתוכים" : ""}
              </span>
            </>
          ) : (
            <span className="fs-16 text-foreground">הזינו רוחב וגובה כדי לראות כמה להזמין.</span>
          )}
        </div>

        <DialogClose asChild>
          <Button asChild className="mt-5 w-full py-4">
            <Link to="/חנות" search={{ cat: "door" }}>
              <span>לכל סוגי הטפטים שלנו</span>
              <Icon name="ArrowLeft" size={16} />
            </Link>
          </Button>
        </DialogClose>
        <Button asChild variant="secondary" className="mt-3 w-full py-4">
          <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
            <span>להתייעצות איתנו בווצאפ</span>
            <Icon name="ChatDots" size={20} />
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
