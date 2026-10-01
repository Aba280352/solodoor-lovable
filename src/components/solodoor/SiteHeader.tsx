import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { CartButton, SearchButton } from "./HeaderActions";
import { Icon } from "./Icon";
import { LOGO_SRC, navLinks, styleMenu, useMenu, type MenuItem } from "./data";
import { useQuiz } from "./quiz-context";

type MenuKey = "style" | "use" | null;

const navLinkClass =
  "py-1.5 fs-15 font-medium whitespace-nowrap text-foreground transition-colors duration-160 ease-standard hover:text-clay";

function MegaMenu({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <div className="absolute inset-x-0 top-full z-20 border-y border-border bg-card shadow-menu">
      <div className="mx-auto max-w-330 px-12 pt-7 pb-8">
        <div className="mb-4.5 fs-15 font-semibold tracking-[0.16em] text-foreground uppercase">{title}</div>
        <div className="grid grid-cols-7 gap-4">
          {items.map((item) => (
            <a key={item.name} href="#" className="group block">
              <div className="aspect-square overflow-hidden rounded-md border border-border bg-muted transition-colors duration-240 ease-standard group-hover:border-foreground">
                <img src={item.img} alt={item.name} className="block size-full object-cover" />
              </div>
              <div className="mt-2.5 fs-16 font-medium text-foreground">{item.name}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuButton({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onMouseEnter={onOpen}
      onClick={onOpen}
      className="inline-flex cursor-pointer items-center gap-1.5 border-b-2 border-transparent py-1.5 fs-15 whitespace-nowrap text-foreground hover:text-clay"
    >
      <span>{label}</span>
      <span className="inline-flex transition-transform duration-160 ease-standard hover:translate-y-px">
        <Icon name="AngleDown" size={14} />
      </span>
    </button>
  );
}

/** Mobile menu order, by importance: home, the two catalogue groups, the shop, then the rest. */
const mobileNavBefore = ["בית"];
const mobileNavAfter = ["ציפוי מטבחים", "ציפוי דלתות", "אודות", "יצירת קשר", "שאלות נפוצות", "מאמרים", "תהליך"];

function MobileNavLink({ label, active }: { label: string; active?: boolean }) {
  return (
    <a
      href="#"
      className={cn("border-b border-border py-3.5 fs-18 font-medium text-foreground", active && "text-clay")}
    >
      {label}
    </a>
  );
}

/** Collapsed by default; opens only when its row is tapped. */
function MobileMenuGroup({ title, items }: { title: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between py-3.5 text-right fs-18 font-medium text-foreground"
      >
        <span>{title}</span>
        <span className={cn("inline-flex transition-transform duration-240 ease-standard", open && "rotate-180")}>
          <Icon name="AngleDown" size={16} />
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-3 pb-4">
          {items.map((item) => (
            <a key={item.name} href="#" className="flex items-center gap-4">
              <div className="size-20 flex-none overflow-hidden rounded-md border border-border bg-muted">
                <img src={item.img} alt={item.name} className="block size-full object-cover" />
              </div>
              <div className="fs-16 font-medium text-foreground">{item.name}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/** Below lg the nav collapses into a full-screen sheet. */
function MobileMenu() {
  const { openQuiz } = useQuiz();
  return (
    <Dialog>
      <DialogTrigger
        aria-label="תפריט"
        className="inline-flex size-10 cursor-pointer items-center justify-center text-foreground lg:hidden"
      >
        <Icon name="Menu" size={24} />
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        overlayClassName="lg:hidden"
        className="m-0 h-max min-h-dvh w-full bg-background px-5 pt-4 pb-10"
      >
        <div className="flex h-12 items-center justify-between">
          <DialogTitle asChild>
            <img src={LOGO_SRC} alt="SOLODOOR" className="block h-10 w-auto" />
          </DialogTitle>
          <DialogClose
            aria-label="סגירה"
            className="inline-flex size-10 cursor-pointer items-center justify-center text-foreground"
          >
            <Icon name="Times" size={24} />
          </DialogClose>
        </div>
        <nav className="mt-4 flex flex-col">
          {mobileNavBefore.map((label, i) => (
            <MobileNavLink key={label} label={label} active={i === 0} />
          ))}
          <MobileMenuGroup title="טפט לפי שימוש" items={useMenu} />
          <MobileMenuGroup title="טפט לפי סגנון" items={styleMenu} />
          <MobileNavLink label="צפייה בכל החנות" />
          {mobileNavAfter.map((label) => (
            <MobileNavLink key={label} label={label} />
          ))}
        </nav>
        <DialogClose asChild>
          <Button type="button" onClick={openQuiz} className="mt-6 w-full px-6 py-4">
            <span>לשאלון הכוונה לבחירת הטפט שלכם</span>
            <Icon name="ArrowLeft" size={16} />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export function SiteHeader() {
  const [menu, setMenu] = useState<MenuKey>(null);

  return (
    <header
      onMouseLeave={() => setMenu(null)}
      className="sticky top-0 z-40 border-b border-border bg-background"
    >
      <div className="mx-auto grid h-16 max-w-330 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 px-5 lg:h-19 lg:px-12">
        <a href="#" className="flex items-center">
          <img
            src={LOGO_SRC}
            alt="SOLODOOR"
            className="block h-10 w-auto lg:h-[3.6875rem] lg:w-[11.6875rem]"
          />
        </a>

        <nav className="hidden min-w-0 flex-nowrap items-center justify-center gap-3.5 lg:flex">
          {navLinks.map((label, i) => (
            <a key={label} href="#" className={cn(navLinkClass, i === 0 && "border-b-2 border-primary")}>
              {label}
            </a>
          ))}
          <MenuButton label="טפט לפי סגנון" onOpen={() => setMenu("style")} />
          <MenuButton label="טפט לפי שימוש" onOpen={() => setMenu("use")} />
        </nav>

        <div className="col-start-3 flex items-center gap-3.5">
          <CartButton />
          <span className="block h-5 w-px bg-border" />
          <SearchButton />
          <Button asChild size="sm" className="hidden border border-primary lg:inline-flex">
            <a href="#">צפייה בכל החנות</a>
          </Button>
          <MobileMenu />
        </div>
      </div>

      {menu === "style" && <MegaMenu title="בחרו טפט לפי סגנון" items={styleMenu} />}
      {menu === "use" && <MegaMenu title="בחרו טפט לפי שימוש" items={useMenu} />}
    </header>
  );
}
