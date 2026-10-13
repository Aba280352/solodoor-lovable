import { Icon } from "./Icon";
import { whatsappHref } from "./whatsapp";

/**
 * The floating WhatsApp button at the bottom right of every page. On a pointer device, hovering it
 * (or reaching it with the keyboard) slides out a short invitation; the whole thing is one link.
 */
export function WhatsAppFloat() {
  return (
    <a
      dir="rtl"
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="שיחה עם סולודור בווצאפ"
      className="group fixed right-4 bottom-4 z-40 flex items-center font-sans lg:right-6 lg:bottom-6"
    >
      {/* The padding, not a margin, bridges the gap to the button, so the pointer can cross to the card without it closing. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full bottom-0 hidden w-80 translate-x-3 pr-3.5 opacity-0 transition-[opacity,translate] duration-240 ease-standard group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 lg:block"
      >
        <span className="flex flex-col gap-2 rounded-[1rem] bg-card p-5 text-right shadow-menu">
          <span className="fs-13 font-bold tracking-[0.12em] text-clay">ייעוץ חינם בווצאפ</span>
          <span className="fs-20 leading-[1.25] font-bold text-foreground">לא בטוחים איזה טפט מתאים לכם?</span>
          <span className="fs-15 leading-[1.6] text-foreground">
            שלחו לנו תמונה של הדלת או המשטח, ונחזור אליכם עם דגמים מתאימים והצעת מחיר.
          </span>
          <span className="mt-1.5 flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-3 fs-16 font-medium text-secondary-foreground">
            <span>לשיחה בווצאפ</span>
            <Icon name="ArrowLeft" size={16} />
          </span>
          <span className="text-center fs-13 leading-[1.5] text-foreground">א' עד ה' 09:00 עד 19:00, ו' 09:00 עד 13:00</span>
        </span>
      </span>
      <span className="flex size-12 flex-none items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-handle transition-transform duration-240 ease-standard group-hover:scale-105 lg:size-14">
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-6.5 lg:size-7.5" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </span>
    </a>
  );
}
