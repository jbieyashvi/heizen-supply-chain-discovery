import { useEffect, useState } from "react";

export interface PageSection {
  id: string;
  label: string;
}

/**
 * Sticky "On this page" nav (desktop) / section dropdown (small screens).
 * Uses IntersectionObserver to highlight the active section.
 */
export function OnThisPageNav({ sections }: { sections: PageSection[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setActive(id);
  };

  return (
    <>
      {/* Desktop: sticky vertical rail */}
      <nav className="otp" aria-label="On this page">
        <span className="otp__label">On this page</span>
        <ul>
          {sections.map((s) => (
            <li key={s.id}>
              <button
                className={`otp__link${active === s.id ? " is-active" : ""}`}
                aria-current={active === s.id ? "true" : undefined}
                onClick={() => go(s.id)}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Small screens: section dropdown */}
      <div className="otp-select">
        <label htmlFor="otp-jump" className="sr-only">
          Jump to section
        </label>
        <select
          id="otp-jump"
          value={active}
          onChange={(e) => go(e.target.value)}
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
