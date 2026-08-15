import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { CURRENCIES } from "../data/mock";

export function CurrencySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const selected = CURRENCIES.find((c) => c.code === value);
  const filtered = CURRENCIES.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="cselect" ref={ref}>
      <button
        type="button"
        className="field-control cselect__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <span>
            <span className="cselect__sym">{selected.symbol}</span>{" "}
            {selected.code} · {selected.name}
          </span>
        ) : (
          <span className="tertiary">Select currency</span>
        )}
        <ChevronDown aria-hidden />
      </button>
      {open && (
        <div className="cselect__pop" role="listbox">
          <div className="cselect__search">
            <Search aria-hidden />
            <input
              autoFocus
              placeholder="Search currency"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="cselect__list">
            {filtered.length === 0 && (
              <div className="cselect__empty">No match</div>
            )}
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                role="option"
                aria-selected={c.code === value}
                className={`cselect__opt${c.code === value ? " is-sel" : ""}`}
                onClick={() => {
                  onChange(c.code);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <span className="cselect__sym">{c.symbol}</span>
                <span className="cselect__code">{c.code}</span>
                <span className="cselect__name truncate">{c.name}</span>
                {c.code === value && <Check className="cselect__check" aria-hidden />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
