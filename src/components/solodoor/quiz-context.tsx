import { createContext, useContext, useMemo, useState, type MouseEvent, type ReactNode } from "react";

interface QuizContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Click handler for any "לשאלון הכוונה" link or button. */
  openQuiz: (event?: MouseEvent) => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo<QuizContextValue>(
    () => ({
      open,
      setOpen,
      openQuiz: (event) => {
        event?.preventDefault();
        setOpen(true);
      },
    }),
    [open],
  );
  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used inside <QuizProvider>");
  return ctx;
}
