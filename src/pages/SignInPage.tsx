import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "../components/ThemeToggle";

type Mode = "email" | "code" | "password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.3 0 24 0 14.6 0 6.4 5.4 2.5 13.2l7.9 6.2C12.3 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.7-9.9 6.7-17.4z" />
      <path fill="#FBBC05" d="M10.4 28.6a14.5 14.5 0 0 1 0-9.2l-7.9-6.2a24 24 0 0 0 0 21.6l7.9-6.2z" />
      <path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.6-5.7l-7.3-5.7c-2 1.4-4.7 2.3-8.3 2.3-6.4 0-11.7-3.7-13.6-9l-7.9 6.2C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function Brand() {
  return (
    <div className="signin__brand">
      <div className="brand__mark" aria-hidden>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path
            d="M5 4v16M19 4v16M5 12h14"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="signin__brand-name">
        Heizen <span>Discovery</span>
      </span>
    </div>
  );
}

export function SignInPage() {
  const { signedIn, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const dest = from && from !== "/sign-in" ? from : "/projects";

  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  // Already signed in → skip the screen.
  if (signedIn) return <Navigate to={dest} replace />;

  const complete = () => {
    signIn(email);
    navigate(dest, { replace: true });
  };

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setMode("code");
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError(null);
    complete();
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    complete();
  };

  return (
    <div className="signin">
      <div className="signin__inner">
        <Brand />

        <div className="signin__card">
          {mode === "email" && (
            <form onSubmit={submitEmail} noValidate>
              <h1 className="signin__title">Welcome back</h1>
              <p className="signin__copy">Sign in to continue to Heizen Discovery.</p>

              <label className="field">
                <span className="field__label" id="email-label">
                  Email
                </span>
                <div className="input-affix">
                  <span className="input-affix__lead">
                    <Mail aria-hidden />
                  </span>
                  <input
                    className="field-control has-lead"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoFocus
                    aria-labelledby="email-label"
                    aria-invalid={Boolean(error)}
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </label>

              {error && <p className="signin__error" role="alert">{error}</p>}

              <button type="submit" className="btn btn-primary signin__submit">
                Continue with email <ArrowRight />
              </button>

              <div className="signin__divider" role="separator">
                <span>or</span>
              </div>

              <button
                type="button"
                className="btn signin__oauth"
                onClick={complete}
              >
                <GoogleG /> Continue with Google
              </button>

              <button
                type="button"
                className="signin__link"
                onClick={() => {
                  setError(null);
                  setMode("password");
                }}
              >
                Sign in with password instead
              </button>
            </form>
          )}

          {mode === "password" && (
            <form onSubmit={submitPassword} noValidate>
              <h1 className="signin__title">Sign in</h1>
              <p className="signin__copy">Use your email and password.</p>

              <label className="field">
                <span className="field__label" id="pw-email-label">Email</span>
                <input
                  className="field-control"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  aria-labelledby="pw-email-label"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field__label" id="pw-label">Password</span>
                <input
                  className="field-control"
                  type="password"
                  autoComplete="current-password"
                  aria-labelledby="pw-label"
                  placeholder="Enter any value (prototype)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              {error && <p className="signin__error" role="alert">{error}</p>}

              <button type="submit" className="btn btn-primary signin__submit">
                <KeyRound /> Sign in
              </button>
              <button
                type="button"
                className="signin__link"
                onClick={() => {
                  setError(null);
                  setMode("email");
                }}
              >
                Use an email code instead
              </button>
            </form>
          )}

          {mode === "code" && (
            <form onSubmit={submitCode} noValidate>
              <h1 className="signin__title">Check your email</h1>
              <p className="signin__copy">
                Enter the 6-digit code we sent to <strong>{email}</strong>.
              </p>

              <label className="field">
                <span className="field__label" id="code-label">Verification code</span>
                <input
                  className="field-control signin__code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  aria-labelledby="code-label"
                  aria-invalid={Boolean(error)}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setResent(false);
                  }}
                />
              </label>

              {error && <p className="signin__error" role="alert">{error}</p>}
              {resent && (
                <p className="signin__hint" role="status">
                  A new code was sent (prototype — any 6 digits work).
                </p>
              )}

              <button type="submit" className="btn btn-primary signin__submit">
                Verify &amp; continue <ArrowRight />
              </button>

              <div className="signin__row">
                <button
                  type="button"
                  className="signin__link"
                  onClick={() => {
                    setError(null);
                    setCode("");
                    setMode("email");
                  }}
                >
                  Change email
                </button>
                <button
                  type="button"
                  className="signin__link"
                  onClick={() => setResent(true)}
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          <p className="signin__proto">
            <ShieldCheck aria-hidden /> Prototype authentication — no credentials
            are sent, stored securely, or verified.
          </p>
        </div>

        <p className="signin__terms">
          By continuing you agree to Heizen's <a href="#terms">Terms</a> and{" "}
          <a href="#privacy">Privacy Policy</a>.
        </p>

        <div className="signin__theme">
          <span>Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
