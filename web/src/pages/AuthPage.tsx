import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Lock,
  Mail,
  Moon,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sun,
  UserCheck,
} from "lucide-react";

import { Logo, Wordmark } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_PERSONAS, type RoleType, useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const { login, loginAsPersona } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activePersona, setActivePersona] = React.useState<RoleType>("AUDITOR");
  const [email, setEmail] = React.useState(DEMO_PERSONAS.AUDITOR.email);
  const [password, setPassword] = React.useState(DEMO_PERSONAS.AUDITOR.password);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Switch persona and update form fields
  const handleSelectPersonaTab = (role: RoleType) => {
    setActivePersona(role);
    const p = DEMO_PERSONAS[role];
    setEmail(p.email);
    setPassword(p.password);
    setError(null);
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter a valid institutional email address.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication failed. Please verify credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const personaMeta = DEMO_PERSONAS[activePersona];

  // Helper to detect institutional domain for enterprise visual badge
  const detectedDomain = React.useMemo(() => {
    const lower = email.toLowerCase();
    if (lower.includes("@fairlens.in")) {
      return {
        name: "Bureau of AI Ethics & Lending Supervision",
        type: "Accredited Audit Agency",
        status: "Certified",
      };
    }
    if (lower.includes("@capitalcredit.in")) {
      return {
        name: "CapitalCredit NBFC Risk Analytics",
        type: "Digital Lending Institution",
        status: "Regulated NBFC",
      };
    }
    if (lower.includes("@rbi.org.in")) {
      return {
        name: "Reserve Bank of India (FinTech Dept.)",
        type: "Central Banking Authority",
        status: "Supervisory Tier-1",
      };
    }
    return null;
  }, [email]);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between transition-colors duration-200">
      {/* Top Corporate Utility Bar */}
      <header className="border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Link to="/welcome" className="flex items-center gap-2.5">
              <Logo size={24} />
              <Wordmark />
            </Link>
            <span className="hidden sm:inline-block h-3.5 w-[1px] bg-line" />
            <span className="hidden sm:inline-block font-mono text-[10px] text-muted uppercase tracking-[0.18em]">
              Enterprise Regulatory Portal · v4.2
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="h-7 gap-1.5 px-2 font-mono text-[11px] border-line bg-raised hover:bg-panel text-muted hover:text-ink"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <>
                  <Moon className="h-3 w-3" />
                  <span className="hidden sm:inline">Terminal Dark</span>
                </>
              ) : (
                <>
                  <Sun className="h-3 w-3" />
                  <span className="hidden sm:inline">Editorial Light</span>
                </>
              )}
            </Button>
            <Link
              to="/welcome"
              className="text-xs font-mono text-muted hover:text-ink px-2 py-1 transition-colors flex items-center gap-1"
            >
              Overview & Architecture
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Corporate Split Workspace */}
      <main className="mx-auto w-full max-w-[1500px] flex-1 px-5 py-8 sm:px-8 lg:py-12 flex items-center">
        <div className="w-full grid gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Institutional Credentials & Regulatory Mandate (6 cols) */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-raised px-3 py-1 font-mono text-[11px] text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                RBI FREE-AI & Digital Lending Framework Compliant
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl lg:leading-tight">
                Institutional Access & Algorithmic Audit Management
              </h1>

              <p className="text-sm text-muted leading-relaxed">
                Secure single sign-on portal for accredited Lead Auditors, NBFC Risk Modelers, and Central
                Bank Regulators conducting automated counterfactual fairness evaluations under RBI Digital
                Lending Directions (2022).
              </p>
            </div>

            {/* Core Regulatory Architecture Highlights */}
            <div className="space-y-3 border-t border-line pt-6">
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Fingerprint className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-ink">Tamper-Evident SHA-256 Ledger Binding</h2>
                  <p className="text-[11px] text-muted mt-0.5 leading-normal">
                    Audit reports and mathematical evidence are signed and committed to an unbroken cryptographic
                    hash chain backed by SQLite.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Scale className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-ink">Enforced Conflict-of-Interest Segregation</h2>
                  <p className="text-[11px] text-muted mt-0.5 leading-normal">
                    Role-Based Access Control (RBAC) bars model developers from certifying their own algorithms,
                    reserving sign-off authority exclusively for accredited auditors.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-ink">Central Supervisory Observer Mode</h2>
                  <p className="text-[11px] text-muted mt-0.5 leading-normal">
                    Regulators maintain independent read-only inspection access to verify model compliance and
                    review raw counterfactual applicant telemetry.
                  </p>
                </div>
              </div>
            </div>

            {/* System Security Telemetry Banner */}
            <div className="rounded-lg border border-line bg-raised/40 p-4 font-mono text-[11px]">
              <div className="text-[10px] uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
                <span>Security Telemetry Status</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Channel Secure (TLS 1.3)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-muted">
                <div>
                  <span className="text-[9.5px] block text-muted/70">Cluster</span>
                  <span className="text-ink font-medium">IN-MUM-01</span>
                </div>
                <div>
                  <span className="text-[9.5px] block text-muted/70">Ledger Integrity</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verified</span>
                </div>
                <div>
                  <span className="text-[9.5px] block text-muted/70">RBAC Policy</span>
                  <span className="text-ink font-medium">Strict Enforced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Corporate Sign-In Form (6 cols) */}
          <div className="lg:col-span-6">
            <div className="panel border border-line bg-panel p-6 sm:p-8 shadow-sm max-w-lg mx-auto">
              {/* Form Title & Icon */}
              <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-ink tracking-tight">Institutional Sign In</h2>
                  <p className="text-xs text-muted mt-0.5">
                    Enter institutional credentials or switch demo evaluation persona.
                  </p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-raised border border-line flex items-center justify-center text-accent">
                  <Lock className="h-4 w-4" />
                </div>
              </div>

              {/* Corporate Persona Quick-Selector (Segmented Tabs) */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted font-medium flex items-center gap-1.5">
                    <UserCheck className="h-3 w-3 text-accent" />
                    Select Evaluation Persona
                  </label>
                  <span className="text-[10px] font-mono text-muted/70">Pitch / Demo Mode</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg border border-line bg-raised">
                  {(["AUDITOR", "ML_ENG", "REGULATOR"] as RoleType[]).map((role) => {
                    const p = DEMO_PERSONAS[role];
                    const active = activePersona === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleSelectPersonaTab(role)}
                        className={`rounded-md py-1.5 px-2 text-center transition-all ${
                          active
                            ? "bg-panel text-ink shadow-sm border border-line font-medium"
                            : "text-muted hover:text-ink hover:bg-panel/50"
                        }`}
                      >
                        <span className="text-xs font-semibold block leading-tight">{p.badge}</span>
                        <span className="text-[10px] font-mono text-muted block mt-0.5">
                          {p.name.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Persona Clearance Card */}
                <div className="mt-3 rounded-md border border-line bg-raised/50 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink text-xs">{personaMeta.name}</span>
                      <Badge
                        variant={personaMeta.role === "AUDITOR" ? "accent" : "outline"}
                        className="text-[9px] py-0"
                      >
                        {personaMeta.role}
                      </Badge>
                    </div>
                    {personaMeta.license_id ? (
                      <span className="font-mono text-[10px] text-accent tabular-nums">
                        {personaMeta.license_id}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-muted">Internal NBFC</span>
                    )}
                  </div>

                  <p className="text-[11px] text-muted mt-1 leading-snug">{personaMeta.description}</p>

                  <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted">Sign-off Authority:</span>
                    <span
                      className={`font-semibold ${
                        personaMeta.role === "AUDITOR"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : personaMeta.role === "ML_ENG"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted"
                      }`}
                    >
                      {personaMeta.role === "AUDITOR"
                        ? "HITL Certified (Accredited)"
                        : personaMeta.role === "ML_ENG"
                          ? "Blocked (Conflict of Interest)"
                          : "Read-Only Supervisory"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 rounded-md border border-red-600/30 bg-red-50 dark:bg-red-950/20 p-3 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-300">
                  <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleStandardLogin} className="space-y-4">
                {/* Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-ink" htmlFor="corporate-email">
                      Institutional Email Address
                    </label>
                    {detectedDomain && (
                      <span className="text-[10px] font-mono text-accent truncate max-w-[200px]">
                        {detectedDomain.type}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                    <Input
                      id="corporate-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="auditor@fairlens.in"
                      className="pl-9 h-9 text-xs font-mono bg-raised border-line text-ink"
                      required
                    />
                  </div>
                </div>

                {/* Password / Passkey */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-ink" htmlFor="corporate-password">
                      Cryptographic Passkey / Password
                    </label>
                    <a
                      href="#recovery"
                      onClick={(e) => {
                        e.preventDefault();
                        setError("Hardware key recovery: Contact your institution's RBI Compliance Officer.");
                      }}
                      className="text-[10.5px] font-mono text-muted hover:text-accent transition-colors"
                    >
                      Key recovery?
                    </a>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                    <Input
                      id="corporate-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="pl-9 pr-9 h-9 text-xs font-mono bg-raised border-line text-ink"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted hover:text-ink transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Session Persistence & Legal Notice */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-muted">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-line text-accent focus:ring-accent h-3.5 w-3.5"
                    />
                    <span className="text-[11px]">Remember authorized terminal</span>
                  </label>
                  <span className="text-[10.5px] font-mono text-muted/70">15-min idle lock</span>
                </div>

                {/* Primary Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-accent text-canvas hover:bg-accent-dim text-xs font-mono font-medium gap-2 mt-3 transition-colors shadow-sm"
                >
                  {loading ? (
                    "Authenticating Token…"
                  ) : (
                    <>
                      <span>Sign In as {personaMeta.name.split(" ")[0]} ({personaMeta.role})</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Corporate SSO Alternative */}
              <div className="mt-5 pt-4 border-t border-line text-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Quick trigger login with active persona
                    loginAsPersona(activePersona).then(() => navigate(redirectPath));
                  }}
                  className="w-full h-8 border-line bg-raised hover:bg-panel text-muted hover:text-ink text-[11px] font-mono gap-1.5"
                >
                  <Building2 className="h-3 w-3" />
                  Authenticate via Institutional SSO (SAML 2.0 / Okta)
                </Button>
                <p className="mt-3 text-[10px] text-muted font-mono leading-relaxed">
                  Protected by Section 45-L of RBI Act, 1934 & FREE-AI Guidelines.
                  Unauthenticated access attempts are logged and flagged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Corporate Security Footer */}
      <footer className="border-t border-line py-4 bg-canvas/80 text-[11px] text-muted font-mono">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-accent" />
            <span>FairLens India Enterprise Risk Gateway · High-Assurance AI Auditing</span>
          </div>
          <div className="flex items-center gap-5 text-muted/80">
            <span>ISO/IEC 42001 Aligned</span>
            <span>256-Bit Hardware Token Ready</span>
            <span>Statutory Auditor Gateway</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
