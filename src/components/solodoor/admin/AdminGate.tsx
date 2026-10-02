import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

import { Icon } from "../Icon";
import { LOGO_SRC } from "../data";

/** The only account allowed in. The database enforces the same rule in its policies. */
export const OWNER_EMAIL = "barido101@gmail.com";

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
        <h1 className="mt-6 fs-24 font-bold text-foreground">כניסה לניהול המאמרים</h1>
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

/** Shows the admin only to the signed-in owner; everyone else sees the login form. */
export function AdminGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <div className="min-h-dvh bg-muted" />;
  if (!session) return <LoginForm />;
  if (session.user.email?.toLowerCase() !== OWNER_EMAIL) {
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
            <span className="fs-15 font-semibold tracking-[0.12em] text-foreground">ניהול מאמרים</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/מאמרים" className="hidden fs-15 font-medium text-foreground hover:text-clay lg:inline">
              לאתר
            </Link>
            <button type="button" onClick={() => supabase.auth.signOut()} className="inline-flex cursor-pointer items-center gap-2 fs-15 font-medium text-foreground hover:text-clay">
              <Icon name="User" size={15} />
              יציאה
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-300 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
