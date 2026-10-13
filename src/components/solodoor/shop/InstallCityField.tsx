import { useId, useMemo, useState, type Ref } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  INSTALL_CITY_BAD,
  INSTALL_CITY_EMPTY,
  INSTALL_CITY_UNKNOWN,
  suggestLocalities,
  type InstallCityStatus,
  type LocalityRow,
} from "./install-areas";

interface InstallCityFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Every locality in Israel, or null while they load. */
  rows: LocalityRow[] | null;
  status: InstallCityStatus;
  /** The visitor left the field or tried to continue: an empty field is then an error too. */
  touched: boolean;
  onTouched: () => void;
  /** The text field itself, so the page can bring it into view when the city is missing. */
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * The place of the installation: a text field that offers the matching localities of Israel while typing.
 * A locality outside the installation areas shows the red note; one inside shows a green go-ahead.
 */
export function InstallCityField({ value, onChange, rows, status, touched, onTouched, inputRef }: InstallCityFieldProps) {
  const listId = useId();
  const noteId = useId();
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);

  const options = useMemo(() => (rows && focused ? suggestLocalities(rows, value) : []), [rows, focused, value]);
  // Nothing to choose once the field holds exactly one of the offered names.
  const open = options.length > 0 && !(options.length === 1 && options[0] === value);

  const choose = (name: string) => {
    onChange(name);
    setActive(-1);
    setFocused(false);
  };

  const message =
    status === "bad"
      ? INSTALL_CITY_BAD
      : status === "unknown" && touched
        ? INSTALL_CITY_UNKNOWN
        : status === "empty" && touched
          ? INSTALL_CITY_EMPTY
          : null;

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={`${listId}-input`} className="fs-15 font-semibold text-foreground">
        באיזו עיר או יישוב תתבצע ההתקנה?
      </label>
      <Input
        ref={inputRef}
        id={`${listId}-input`}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={Boolean(message)}
        aria-describedby={noteId}
        autoComplete="off"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(-1);
          // Typing again after picking a place (the field still has focus) opens the list again.
          setFocused(true);
        }}
        onFocus={() => setFocused(true)}
        onClick={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onTouched();
        }}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % options.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            choose(options[active]);
          } else if (e.key === "Escape") {
            setFocused(false);
          }
        }}
        placeholder="התחילו להקליד, לדוגמה: תל אביב"
        className={cn("bg-card fs-16", message && "border-destructive")}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-card py-1 shadow-md"
        >
          {options.map((name, i) => (
            <li
              key={name}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              // The mouse goes down before the field loses focus, so the list is still there to be clicked.
              onMouseDown={(e) => {
                e.preventDefault();
                choose(name);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn("cursor-pointer px-3.5 py-2.5 text-right fs-16 text-foreground", i === active && "bg-muted")}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
      {(message || status === "ok") && (
        <span
          id={noteId}
          role={message ? "alert" : "status"}
          className={cn("fs-15 leading-[1.5] font-bold", message ? "text-destructive" : "text-secondary")}
        >
          {message ?? `מצוין, צוות סולודור מתקין ב${value.trim()}. אפשר להמשיך.`}
        </span>
      )}
    </div>
  );
}
