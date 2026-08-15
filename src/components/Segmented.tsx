export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: SegmentOption<T>[];
  ariaLabel: string;
}

/** Accessible tab-style segmented control (roving via arrow keys). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: SegmentedProps<T>) {
  const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = (idx + dir + options.length) % options.length;
      onChange(options[next].id);
    }
  };
  return (
    <div className="segmented" role="tablist" aria-label={ariaLabel}>
      {options.map((o, i) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={`segmented__btn${active ? " is-active" : ""}`}
            onClick={() => onChange(o.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
