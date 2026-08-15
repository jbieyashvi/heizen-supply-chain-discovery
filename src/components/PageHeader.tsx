import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  crumbs?: Crumb[];
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Optional extra row rendered under the title (e.g. project meta). */
  meta?: ReactNode;
}

export function PageHeader({
  crumbs,
  title,
  subtitle,
  actions,
  meta,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      {crumbs && crumbs.length > 0 && (
        <nav className="crumbs" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={i} className="crumbs__item">
              {c.to ? (
                <Link to={c.to} className="crumbs__link">
                  {c.label}
                </Link>
              ) : (
                <span className="crumbs__current">{c.label}</span>
              )}
              {i < crumbs.length - 1 && (
                <ChevronRight className="crumbs__sep" aria-hidden />
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="page-header__row">
        <div className="stack" style={{ gap: 6, minWidth: 0 }}>
          <div className="page-header__title-row">{title}</div>
          {subtitle && <p className="page-header__sub">{subtitle}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
      {meta && <div className="page-header__meta">{meta}</div>}
    </header>
  );
}
