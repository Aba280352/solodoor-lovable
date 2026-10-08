import { Fragment, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { CartButton, SearchButton } from "./HeaderActions";
import { Icon } from "./Icon";
import { LOGO_SRC, RUGS_LABEL, navLinks, styleMenu, useMenu, type MenuItem } from "./data";
import { useQuiz } from "./quiz-context";
import { FOOTER_ANCHORS, scrollToAboutOnHome, scrollToFooterAnchor } from "./shop/footer-anchors";
import { MenuLink } from "./shop/MenuLink";
import { STYLE_HUB_PATH } from "./shop/styles";

type MenuKey = "style" | "use" | null;

const navLinkClass =
  "py-1.5 fs-14 font-medium whitespace-nowrap text-foreground transition-colors duration-160 ease-standard hover:text-clay";

/** The main archives the two menu entries lead to: the whole shop, and the wallpaper styles. */
type ArchivePath = "/חנות" | typeof STYLE_HUB_PATH;

/** The link that sits with a menu and leads to its whole archive. */
interface AllLink {
  label: string;
  to: ArchivePath;
}

function MegaMenu({ title, items, allLink }: { title: string; items: MenuItem[]; allLink?: AllLink }) {
  return (
    <div className="absolute inset-x-0 top-full z-20 border-y border-border bg-card shadow-menu">
      <div className="mx-auto max-w-330 px-12 pt-7 pb-8">
        <div className="mb-4.5 flex items-center justify-between gap-4">
          <span className="fs-15 font-semibold tracking-[0.16em] text-foreground uppercase">{title}</span>
          {allLink && (
            <Link to={allLink.to} className="inline-flex items-center gap-2 fs-15 font-medium text-foreground transition-colors duration-160 ease-standard hover:text-clay">
              <span>{allLink.label}</span>
              <Icon name="AngleLeft" size={12} />
            </Link>
          )}
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(7, items.length)}, minmax(0, 1fr))` }}>
          {items.map((item) => (
            <MenuLink key={item.name} name={item.name} className="group block">
              <div className="aspect-square overflow-hidden rounded-md border border-border bg-muted transition-colors duration-240 ease-standard group-hover:border-foreground">
                <img src={item.img} alt={item.name} className="block size-full object-cover" />
              </div>
              <div className="mt-2.5 fs-16 font-medium text-foreground">{item.name}</div>
            </MenuLink>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A nav entry that opens its mega menu on hover or focus, and goes to the main archive when clicked. */
function MenuButton({ label, to, onOpen, onClose }: { label: string; to: ArchivePath; onOpen: () => void; onClose: () => void }) {
  return (
    <Link
      to={to}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onClose}
      className="inline-flex cursor-pointer items-center gap-1.5 border-b-2 border-transparent py-1.5 fs-14 whitespace-nowrap text-foreground hover:text-clay"
    >
      <span>{label}</span>
      <span className="inline-flex transition-transform duration-160 ease-standard hover:translate-y-px">
        <Icon name="AngleDown" size={14} />
      </span>
    </Link>
  );
}

/** Pages that exist so far. Every other nav label is still a placeholder link. */
const PAGE_PATHS: Record<string, "/" | "/ציפוי-מטבחים" | "/ציפוי-דלתות" | "/חנות" | "/מאמרים" | "/שאלות-נפוצות"> = {
  בית: "/",
  "צפייה בכל החנות": "/חנות",
  מאמרים: "/מאמרים",
  "שאלות נפוצות": "/שאלות-נפוצות",
  "ציפוי מטבחים": "/ציפוי-מטבחים",
  "ציפוי דלתות": "/ציפוי-דלתות",
};

/** Mobile menu order, by importance: home, the two catalogue groups, the shop, then the rest. */
const mobileNavBefore = ["בית"];
const mobileNavAfter = ["ציפוי מטבחים", "ציפוי דלתות", RUGS_LABEL, "אודות", "יצירת קשר", "שאלות נפוצות", "מאמרים"];

const mobileLinkClass = "border-b border-border py-3.5 fs-18 font-medium text-foreground";

/** Real pages and in-page jumps close the menu; placeholders do nothing yet. */
function MobileNavLink({ label, diy }: { label: string; diy?: boolean }) {
  const to = PAGE_PATHS[label];
  const anchor = FOOTER_ANCHORS[label];
  if (label === RUGS_LABEL) {
    return (
      <DialogClose asChild>
        <Link to="/חנות" search={{ cat: "pvc_rug" }} className={mobileLinkClass} activeProps={{ className: "text-clay" }}>
          {label}
        </Link>
      </DialogClose>
    );
  }
  if (label === "אודות") {
    return (
      <DialogClose asChild>
        <Link
          to="/"
          hash="about"
          // No preventDefault: the dialog's close handler skips prevented clicks. The sheet closes first, then the page scrolls.
          onClick={() => window.setTimeout(scrollToAboutOnHome, 150)}
          className={mobileLinkClass}
        >
          {label}
        </Link>
      </DialogClose>
    );
  }
  if (anchor) {
    // Close the sheet first, so the page can scroll again before it jumps to the footer.
    return (
      <DialogClose asChild>
        <a
          href={`#${anchor}`}
          // No preventDefault: the dialog's close handler skips prevented clicks, and the sheet must close.
          onClick={() => window.setTimeout(() => scrollToFooterAnchor(anchor), 150)}
          className={mobileLinkClass}
        >
          {label}
        </a>
      </DialogClose>
    );
  }
  if (diy) {
    return (
      <DialogClose asChild>
        <Link to="/" hash="diy" className={mobileLinkClass}>
          {label}
        </Link>
      </DialogClose>
    );
  }
  if (to) {
    return (
      <DialogClose asChild>
        <Link to={to} className={mobileLinkClass} activeProps={{ className: "text-clay" }} activeOptions={{ exact: true }}>
          {label}
        </Link>
      </DialogClose>
    );
  }
  return (
    <a href="#" className={mobileLinkClass}>
      {label}
    </a>
  );
}

/** Desktop nav item; the current page gets the clay underline. */
function NavItem({ label }: { label: string }) {
  const to = PAGE_PATHS[label];
  const anchor = FOOTER_ANCHORS[label];
  if (label === RUGS_LABEL) {
    return (
      <Link to="/חנות" search={{ cat: "pvc_rug" }} className={navLinkClass} activeProps={{ className: "border-b-2 border-primary" }}>
        {label}
      </Link>
    );
  }
  if (label === "אודות") {
    return (
      <Link
        to="/"
        hash="about"
        onClick={(e) => {
          if (scrollToAboutOnHome()) e.preventDefault();
        }}
        className={navLinkClass}
      >
        {label}
      </Link>
    );
  }
  if (anchor) {
    return (
      <a
        href={`#${anchor}`}
        onClick={(e) => {
          e.preventDefault();
          scrollToFooterAnchor(anchor);
        }}
        className={navLinkClass}
      >
        {label}
      </a>
    );
  }
  if (!to) {
    return (
      <a href="#" className={navLinkClass}>
        {label}
      </a>
    );
  }
  return (
    <Link
      to={to}
      className={navLinkClass}
      activeProps={{ className: "border-b-2 border-primary" }}
      activeOptions={{ exact: true }}
    >
      {label}
    </Link>
  );
}

/** Collapsed by default; opens only when its row is tapped. */
function MobileMenuGroup({ title, to, items, allLink }: { title: string; to: ArchivePath; items: MenuItem[]; allLink?: AllLink }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between">
        <DialogClose asChild>
          <Link to={to} className="flex-auto py-3.5 text-right fs-18 font-medium text-foreground">
            {title}
          </Link>
        </DialogClose>
        <button
          type="button"
          aria-expanded={open}
          aria-label={`${title}, הצגת הרשימה`}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex size-11 flex-none cursor-pointer items-center justify-center text-foreground"
        >
          <span className={cn("inline-flex transition-transform duration-240 ease-standard", open && "rotate-180")}>
            <Icon name="AngleDown" size={16} />
          </span>
        </button>
      </div>
      {open && (
        <div className="flex flex-col gap-3 pb-4">
          {allLink && (
            <DialogClose asChild>
              <Link to={allLink.to} className="fs-16 font-medium text-clay">
                {allLink.label}
              </Link>
            </DialogClose>
          )}
          {items.map((item) => (
            <DialogClose key={item.name} asChild>
              <MenuLink name={item.name} className="flex items-center gap-4">
              <div className="size-20 flex-none overflow-hidden rounded-md border border-border bg-muted">
                <img src={item.img} alt={item.name} className="block size-full object-cover" />
              </div>
              <div className="fs-16 font-medium text-foreground">{item.name}</div>
              </MenuLink>
            </DialogClose>
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
          {mobileNavBefore.map((label) => (
            <MobileNavLink key={label} label={label} />
          ))}
          <MobileMenuGroup title="טפט לפי שימוש" to="/חנות" items={useMenu} />
          <MobileMenuGroup title="טפט לפי סגנון" to={STYLE_HUB_PATH} items={styleMenu} allLink={{ label: "לכל הסגנונות", to: STYLE_HUB_PATH }} />
          <MobileNavLink label="צפייה בכל החנות" />
          <MobileNavLink label="עשה זאת בעצמך" diy />
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
      <div className="mx-auto grid h-16 max-w-330 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 px-5 lg:gap-4 lg:h-19 lg:px-12">
        {/* The whole header height is the tap target. The image ignores touches, so the link itself gets them (iPhone Safari
            can swallow a tap on an image inside a link, or open the "save image" menu on a long press). */}
        <Link
          to="/"
          aria-label="SOLODOOR, לדף הבית"
          onClick={(e) => {
            // Already on the home page: the router would do nothing, so scroll to the top and drop any #hash.
            if (window.location.pathname !== "/") return;
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
            if (window.location.hash) history.replaceState(null, "", `/${window.location.search}`);
          }}
          className="flex h-full min-h-11 min-w-11 touch-manipulation items-center"
        >
          <img
            src={LOGO_SRC}
            alt=""
            draggable={false}
            className="pointer-events-none block h-10 w-auto select-none [-webkit-touch-callout:none] lg:h-[3.6875rem] lg:w-[11.6875rem]"
          />
        </Link>

        <nav className="hidden min-w-0 flex-nowrap items-center justify-center gap-1.5 lg:flex">
          {navLinks.map((label, i) => (
            <Fragment key={label}>
              <NavItem label={label} />
              {i === 0 && (
                <Link to="/" hash="diy" className={navLinkClass}>
                  עשה זאת בעצמך
                </Link>
              )}
            </Fragment>
          ))}
          <MenuButton label="טפט לפי סגנון" to={STYLE_HUB_PATH} onOpen={() => setMenu("style")} onClose={() => setMenu(null)} />
          <MenuButton label="טפט לפי שימוש" to="/חנות" onOpen={() => setMenu("use")} onClose={() => setMenu(null)} />
        </nav>

        <div className="col-start-3 flex items-center gap-3.5">
          <CartButton />
          <span className="block h-5 w-px bg-border" />
          <SearchButton />
          <Button asChild size="sm" className="hidden border border-primary lg:inline-flex">
            <Link to="/חנות">צפייה בכל החנות</Link>
          </Button>
          <MobileMenu />
        </div>
      </div>

      {menu === "style" && <MegaMenu title="בחרו טפט לפי סגנון" items={styleMenu} allLink={{ label: "לכל הסגנונות", to: STYLE_HUB_PATH }} />}
      {menu === "use" && <MegaMenu title="בחרו טפט לפי שימוש" items={useMenu} />}
    </header>
  );
}
