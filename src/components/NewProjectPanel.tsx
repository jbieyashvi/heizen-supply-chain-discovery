import { useState } from "react";
import { Sparkle, ChevronDown, Info } from "lucide-react";
import { SidePanel } from "./SidePanel";
import { CurrencySelect } from "./CurrencySelect";
import { INDUSTRIES, CURRENCIES } from "../data/mock";
import { useToast } from "./Toast";

function Field({
  label,
  required,
  recommended,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  recommended?: boolean;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="field__req" aria-hidden> *</span>}
        {recommended && <span className="field__rec">Recommended</span>}
      </label>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}

export function NewProjectPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [website, setWebsite] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [contextOpen, setContextOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);

  // Only name + client are required. Website is strongly recommended.
  const canCreate = Boolean(name.trim() && client.trim());
  const needsEntityConfirm = canCreate && !website.trim();

  const reset = () => {
    setName("");
    setClient("");
    setWebsite("");
    setCurrency("INR");
    setContextOpen(false);
    setResearchOpen(false);
  };

  const submit = (start: boolean) => {
    notify({
      title: start ? "Project created — research starting" : "Draft project saved",
      body: start
        ? needsEntityConfirm
          ? `${name || "New project"} created. Research setup may ask you to confirm the company entity.`
          : `${name || "New project"} is queued. Research will run in the background.`
        : `${name || "New project"} saved. Add more context anytime to improve research.`,
    });
    reset();
    onClose();
  };

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="New project"
      subtitle="Set up a client for discovery."
      footer={
        <>
          {!canCreate && (
            <span className="np-foot-hint" aria-live="polite">
              Add a project name and client to continue
            </span>
          )}
          <button className="btn btn-ghost" onClick={() => submit(false)}>
            Save as draft
          </button>
          <button
            className="btn btn-primary"
            disabled={!canCreate}
            onClick={() => submit(true)}
            aria-disabled={!canCreate}
            title={
              canCreate
                ? "Create the project and start research"
                : "Add a project name and client first"
            }
          >
            <Sparkle style={{ width: 15, height: 15 }} />
            Create &amp; start research
          </button>
        </>
      }
    >
      <div className="np-note">
        <Info aria-hidden />
        <span>
          Only project name and client are required to start. The more context you
          add, the sharper the generated research and discovery questions.
        </span>
      </div>

      <fieldset className="np-group">
        <legend className="np-group__legend">Essentials</legend>
        <Field label="Project name" required htmlFor="np-name">
          <input
            id="np-name"
            className="field-control"
            placeholder="e.g. Clio Snacks — Ops Discovery"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Client / company name" required htmlFor="np-client">
          <input
            id="np-client"
            className="field-control"
            placeholder="e.g. Clio Snacks Pvt. Ltd."
            value={client}
            onChange={(e) => setClient(e.target.value)}
          />
        </Field>
        <Field
          label="Company website"
          recommended
          htmlFor="np-web"
          hint="Adding the company website helps us identify the correct entity and improves research accuracy."
        >
          <input
            id="np-web"
            className="field-control"
            placeholder="https://company.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          {needsEntityConfirm && (
            <span className="field-flag">
              <Info aria-hidden />
              Without a website, research setup may ask you to confirm the company
              entity.
            </span>
          )}
        </Field>
      </fieldset>

      {/* Progressive group: company context */}
      <section className="np-collapse">
        <button
          className="np-collapse__head"
          onClick={() => setContextOpen((v) => !v)}
          aria-expanded={contextOpen}
        >
          <span>
            <span className="np-collapse__title">Company context</span>
            <span className="np-collapse__opt">Optional · improves research</span>
          </span>
          <ChevronDown className={`np-chev${contextOpen ? " is-open" : ""}`} />
        </button>
        {contextOpen && (
          <div className="np-collapse__body">
            <Field label="Industry" htmlFor="np-industry">
              <div className="select-wrap">
                <select id="np-industry" className="field-control" defaultValue="">
                  <option value="" disabled>
                    Select industry
                  </option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden />
              </div>
            </Field>
            <Field label="Business unit or geography" htmlFor="np-geo">
              <input
                id="np-geo"
                className="field-control"
                placeholder="e.g. India — Snacks Division"
              />
            </Field>
            <div className="field-2col">
              <Field label="Primary stakeholder" htmlFor="np-stake">
                <input
                  id="np-stake"
                  className="field-control"
                  placeholder="e.g. Meera Iyer"
                />
              </Field>
              <Field label="Stakeholder role" htmlFor="np-role">
                <input
                  id="np-role"
                  className="field-control"
                  placeholder="e.g. VP Operations"
                />
              </Field>
            </div>
            <Field label="Upcoming meeting" htmlFor="np-meet">
              <input id="np-meet" type="datetime-local" className="field-control" />
            </Field>
            <div className="field-2col">
              <Field
                label="Annual revenue"
                htmlFor="np-rev"
                hint="Approximate, in millions."
              >
                <div className="input-affix">
                  <span className="input-affix__lead">
                    {CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹"}
                  </span>
                  <input
                    id="np-rev"
                    className="field-control has-lead"
                    inputMode="numeric"
                    placeholder="850"
                    aria-describedby="np-rev-unit"
                  />
                  <span className="input-affix__trail" id="np-rev-unit">
                    M {currency}
                  </span>
                </div>
              </Field>
              <Field label="Currency">
                <CurrencySelect value={currency} onChange={setCurrency} />
              </Field>
            </div>
          </div>
        )}
      </section>

      {/* Progressive group: research focus */}
      <section className="np-collapse">
        <button
          className="np-collapse__head"
          onClick={() => setResearchOpen((v) => !v)}
          aria-expanded={researchOpen}
        >
          <span>
            <span className="np-collapse__title">Known request & research focus</span>
            <span className="np-collapse__opt">Optional · steers the analysis</span>
          </span>
          <ChevronDown className={`np-chev${researchOpen ? " is-open" : ""}`} />
        </button>
        {researchOpen && (
          <div className="np-collapse__body">
            <Field
              label="Known client request or pain"
              htmlFor="np-pain"
              hint="What prompted this conversation? Even a rough note helps."
            >
              <textarea
                id="np-pain"
                className="field-control"
                rows={3}
                placeholder="e.g. Manual production tracking, considering NetSuite support alternatives."
              />
            </Field>
            <Field
              label="Research focus / instructions"
              htmlFor="np-focus"
              hint="Tell research where to concentrate — e.g. a system, a compliance area, a region."
            >
              <textarea
                id="np-focus"
                className="field-control"
                rows={3}
                placeholder="e.g. Focus on manufacturing execution, FSMA 204 readiness, and ERP support."
              />
            </Field>
          </div>
        )}
      </section>
    </SidePanel>
  );
}
