import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Lock,
  Mail,
  Moon,
  Scale,
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

  const [email, setEmail] = React.useState("auditor@fairlens.in");
  const [password, setPassword] = React.useState("Auditor@2026");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPersona = async (role: RoleType) => {
    setError(null);
    setLoading(true);
    try {
      await loginAsPersona(role);
      navigate(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with demo persona.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-5 sm:px-8">
          <Link to="/welcome" className="flex items-center gap-3">
            <Logo size={28} />
            <Wordmark />
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="h-8 gap-1.5 px-2.5 font-mono text-xs border-line bg-raised hover:bg-panel text-muted hover:text-ink"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <>
                  <Moon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Terminal Dark</span>
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Editorial Light</span>
                </>
              )}
            </Button>
            <Link
              to="/welcome"
              className="text-xs font-mono text-muted hover:text-ink px-2 py-1 transition-colors"
            >
              Back to Overview
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-raised px-3 py-1 font-mono text-xs text-muted mb-3">
            <Lock className="h-3.5 w-3.5 text-accent" />
            Accredited Role-Based Access Control (RBAC)
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Sign In to FairLens India
          </h1>
          <p className="text-xs text-muted mt-2">
            Select a verified demo persona for live judging demonstration or sign in using institution credentials.
          </p>
        </div>

        {/* 1-Click Demo Persona Selector Strip */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-accent" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                1-Click Demo Persona Selector (Pitch / Evaluation Mode)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-muted">
              Select persona to authenticate instantly
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Persona 1: Auditor */}
            <div
              onClick={() => handleSelectPersona("AUDITOR")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleSelectPersona("AUDITOR")}
              className="group panel border-2 border-accent/40 bg-panel p-5 text-left cursor-pointer hover:border-accent hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-accent text-canvas px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-bl">
                Recommended
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink group-hover:text-accent transition-colors">
                    {DEMO_PERSONAS.AUDITOR.name}
                  </h3>
                  <Badge variant="accent" className="text-[9px] px-1.5 py-0 mt-0.5">
                    {DEMO_PERSONAS.AUDITOR.role}
                  </Badge>
                </div>
              </div>

              <p className="text-[11px] text-muted line-clamp-2 mb-3">
                {DEMO_PERSONAS.AUDITOR.description}
              </p>

              <div className="space-y-1 pt-2 border-t border-line text-[10px] font-mono text-muted">
                <div className="flex justify-between">
                  <span>License ID:</span>
                  <span className="font-semibold text-ink tabular-nums">{DEMO_PERSONAS.AUDITOR.license_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sign-Off Authority:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">HITL Certified</span>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full mt-4 h-8 bg-accent text-canvas hover:bg-accent-dim text-xs font-mono gap-1.5 font-medium"
              >
                Sign In as Lead Auditor
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>

            {/* Persona 2: ML Engineer */}
            <div
              onClick={() => handleSelectPersona("ML_ENG")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleSelectPersona("ML_ENG")}
              className="group panel border border-line bg-panel p-5 text-left cursor-pointer hover:border-line/80 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-raised border border-line flex items-center justify-center text-muted">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink group-hover:text-accent transition-colors">
                    {DEMO_PERSONAS.ML_ENG.name}
                  </h3>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 mt-0.5">
                    {DEMO_PERSONAS.ML_ENG.role}
                  </Badge>
                </div>
              </div>

              <p className="text-[11px] text-muted line-clamp-2 mb-3">
                {DEMO_PERSONAS.ML_ENG.description}
              </p>

              <div className="space-y-1 pt-2 border-t border-line text-[10px] font-mono text-muted">
                <div className="flex justify-between">
                  <span>Organization:</span>
                  <span className="font-semibold text-ink truncate max-w-[140px]">CapitalCredit NBFC</span>
                </div>
                <div className="flex justify-between">
                  <span>Sign-Off Authority:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Blocked (Conflict)</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 h-8 border-line bg-raised hover:bg-panel text-ink text-xs font-mono gap-1.5"
              >
                Sign In as ML Engineer
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>

            {/* Persona 3: Regulator */}
            <div
              onClick={() => handleSelectPersona("REGULATOR")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleSelectPersona("REGULATOR")}
              className="group panel border border-line bg-panel p-5 text-left cursor-pointer hover:border-line/80 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-raised border border-line flex items-center justify-center text-muted">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink group-hover:text-accent transition-colors">
                    {DEMO_PERSONAS.REGULATOR.name}
                  </h3>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 mt-0.5">
                    {DEMO_PERSONAS.REGULATOR.role}
                  </Badge>
                </div>
              </div>

              <p className="text-[11px] text-muted line-clamp-2 mb-3">
                {DEMO_PERSONAS.REGULATOR.description}
              </p>

              <div className="space-y-1 pt-2 border-t border-line text-[10px] font-mono text-muted">
                <div className="flex justify-between">
                  <span>Supervisory ID:</span>
                  <span className="font-semibold text-ink tabular-nums">{DEMO_PERSONAS.REGULATOR.license_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sign-Off Authority:</span>
                  <span className="font-semibold text-muted">Read-Only Observer</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 h-8 border-line bg-raised hover:bg-panel text-ink text-xs font-mono gap-1.5"
              >
                Sign In as RBI Observer
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Standard Email / Password Form */}
        <div className="max-w-md mx-auto panel border border-line bg-panel p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-ink">Institutional Sign In</h2>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-600/30 bg-red-50 dark:bg-red-950/20 p-3 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-300">
              <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="auditor@fairlens.in"
                  className="pl-9 h-9 text-xs font-mono bg-raised border-line text-ink"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1" htmlFor="login-password">
                Password / Secure Passkey
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                <Input
                  id="login-password"
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
                  className="absolute right-3 top-2.5 text-muted hover:text-ink"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-accent text-canvas hover:bg-accent-dim text-xs font-mono font-medium gap-2 mt-2"
            >
              {loading ? "Authenticating…" : "Authenticate & Continue"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-line text-center text-[11px] text-muted font-mono">
            Protected by RBI FREE-AI Compliant RBAC Policy
          </div>
        </div>
      </main>
    </div>
  );
}
