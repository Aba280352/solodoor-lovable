import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useLocation } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

import { Icon } from "../Icon";
import { LOGO_SRC } from "../data";
import { db } from "./db";

/** The site owner. The table admin_users and the database policies hold the same rule. */
export const OWNER_EMAIL = "barido101@gmail.com";

/** "owner" sees the whole admin; "editor" (the client) sees the leads. Kept in the table admin_users. */
type Role = "owner" | "editor";

/** The areas of the admin, in the order of the header, and who sees each. */
const NAV: { to: "/admin/leads" | "/admin" | "/admin/products" | "/admin/prices" | "/admin/faq" | "/admin/content"; label: string; roles: Role[] }[] = [
  { to: "/admin/leads", label: "פניות", roles: ["owner", "editor"] },
  { to: "/admin", label: "מאמרים", roles: ["owner"] },
  { to: "/admin/products", label: "מוצרים", roles: ["owner"] },
  { to: "/admin/prices", label: "מחירים", roles: ["owner"] },
  { to: "/admin/faq", label: "שאלות נפוצות", roles: ["owner"] },
  { to: "/admin/content", label: "לשוניות", roles: ["owner"] },
];

/** Lets the signed-in user replace their password (a new account starts with a temporary one). */
function PasswordForm({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setMessage("הסיסמה צריכה להיות באורך 8 תווים לפחות.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    setMessage(error ? `השינוי נכשל: ${error.message}` : "הסיסמה הוחלפה.");
    if (!error) setPassword("");
  };
  return (
    <form onSubmit={submit} className="mx-auto flex max-w-300 flex-wrap items-center gap-3 px-5 pb-3 lg:px-8">
      <Input type="password" autoComplete="new-password" placeholder="סיסמה חדשה" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" className="max-w-64 text-left fs-15" />
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? "רגע…" : "שמירת הסיסמה"}
      </Button>
      <button type="button" onClick={onClose} className="cursor-pointer fs-15 text-foreground hover:text-clay">
        סגירה
      </button>
      {message && <span className="fs-15 font-medium text-foreground">{message}</span>}
    </form>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setError("האימייל או הסיסמה לא נכונים.");
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted px-5">
      <form onSubmit={submit} className="w-full max-w-100 rounded-lg border border-border bg-card px-6 py-8 text-right lg:px-8">
        <img src={LOGO_SRC} alt="SOLODOOR" className="h-9" />
        <h1 className="mt-6 fs-24 font-bold text-foreground">כניסה לניהול האתר</h1>
        <div className="mt-5 flex flex-col gap-3">
          <Input type="email" autoComplete="username" required placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="text-left fs-16" />
          <Input type="password" autoComplete="current-password" required placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" className="text-left fs-16" />
        </div>
        {error && <p className="mt-3 fs-15 text-clay">{error}</p>}
        <Button type="submit" disabled={busy} className="mt-5 w-full py-3.5">
          {busy ? "רגע…" : "כניסה"}
        </Button>
      </form>
    </div>
  );
}

/** Shows the admin to signed-in admins (owner or editor); everyone else sees the login form. */
export function AdminGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [role, setRole] = useState<Role | null | undefined>(undefined);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const pathname = useLocation({ select: (l) => l.pathname });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const email = session?.user.email?.toLowerCase();
  useEffect(() => {
    if (!email) {
      setRole(undefined);
      return;
    }
    db.rpc("admin_role").then(({ data, error }) =>
      // Should the roles table be unreachable, the owner still gets in, as before it existed.
      setRole(error ? (email === OWNER_EMAIL ? "owner" : null) : ((data as Role | null) ?? null)),
    );
  }, [email]);

  if (session === undefined) return <div className="min-h-dvh bg-muted" />;
  if (!session) return <LoginForm />;
  if (role === undefined) return <div className="min-h-dvh bg-muted" />;
  // The client's account only reaches the leads.
  if (role === "editor" && !pathname.startsWith("/admin/leads")) return <Navigate to="/admin/leads" />;
  if (!role) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-muted px-5 text-center">
        <p className="fs-18 text-foreground">לחשבון הזה אין הרשאת עריכה.</p>
        <Button type="button" variant="outline" onClick={() => supabase.auth.signOut()}>
          יציאה
        </Button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-dvh bg-muted font-sans text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-300 items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <div className="flex items-center gap-5">
            <Link to="/admin">
              <img src={LOGO_SRC} alt="SOLODOOR" className="h-8" />
            </Link>
            <nav aria-label="אזורי הניהול" className="flex items-center gap-1">
              {NAV.filter((item) => item.roles.includes(role)).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/admin" }}
                  className="rounded-md px-3 py-1.5 fs-15 font-semibold text-foreground hover:bg-muted"
                  activeProps={{ className: "rounded-md bg-primary px-3 py-1.5 fs-15 font-semibold text-primary-foreground" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/מאמרים" className="hidden fs-15 font-medium text-foreground hover:text-clay lg:inline">
              לאתר
            </Link>
            <button type="button" onClick={() => setPasswordOpen((o) => !o)} className="cursor-pointer fs-15 font-medium text-foreground hover:text-clay">
              שינוי סיסמה
            </button>
            <button type="button" onClick={() => supabase.auth.signOut()} className="inline-flex cursor-pointer items-center gap-2 fs-15 font-medium text-foreground hover:text-clay">
              <Icon name="User" size={15} />
              יציאה
            </button>
          </div>
        </div>
        {passwordOpen && <PasswordForm onClose={() => setPasswordOpen(false)} />}
      </header>
      <main className="mx-auto max-w-300 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
