import { type ReactNode, useId } from "react";

const base =
  "w-full border border-hairline bg-card px-4 py-3.5 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-bronze focus:ring-1 focus:ring-bronze";

export function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
}) {
  const hintId = useId();
  const errorId = useId();
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div>
      <label htmlFor={id} className="label-xs block text-muted-foreground">
        {label}
        {required ? <span className="text-bronze"> *</span> : null}
      </label>
      <div className="mt-2.5">{children}</div>
      {error ? (
        <p id={errorId} className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass = base;
export const errorInputClass = `${base} border-destructive focus:border-destructive focus:ring-destructive`;
