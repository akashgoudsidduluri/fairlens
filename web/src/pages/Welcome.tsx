import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Database,
  ExternalLink,
  Fingerprint,
  Moon,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Users,
  Zap,
} from "lucide-react";

import { Logo, Wordmark } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export function Welcome() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { loginAsPersona } = useAuth();

  // Interactive Counterfactual Twin State
  const [gender, setGender] = React.useState<"male" | "female">("female");
  const [pincodeGroup, setPincodeGroup] = React.useState<"urban" | "rural">("rural");

  // Determine decision based on flipped protected attributes
  const isApproved = gender === "male" && pincodeGroup === "urban";

  return (
    <div className="min-h-screen bg-canvas text-ink transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link to="/welcome" className="flex items-center gap-3">
              <Logo size={28} />
              <Wordmark />
            </Link>
            <div className="hidden sm:block h-4 w-[1px] bg-line" />
            <Badge
              variant="outline"
              className="hidden sm:inline-flex items-center gap-1.5 border-line bg-raised/60 text-muted"
            >
              <ShieldCheck className="h-3 w-3 text-accent" />
              RBI FREE-AI Framework Aligned
            </Badge>
          </div>

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
              to="/"
              className="hidden md:inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-ink px-2 py-1 transition-colors"
            >
              Public Replay Library
              <ExternalLink className="h-3 w-3 ml-0.5 opacity-60" />
            </Link>

            <Link to="/auth/login">
              <Button size="sm" className="h-8 bg-accent text-canvas hover:bg-accent-dim font-medium text-xs px-3 gap-1.5">
                Auditor Portal Sign In
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 lg:py-16">
        {/* Hero Section */}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Authoritative Editorial Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-raised px-3 py-1 font-mono text-xs text-muted">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              Black-Box Counterfactual Fairness Auditing
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl lg:leading-[1.15]">
              See what the lending model decides when{" "}
              <span className="text-accent underline decoration-accent/40 underline-offset-4">
                only one protected attribute
              </span>{" "}
              changes.
            </h1>

            <p className="text-base text-muted leading-relaxed sm:text-lg">
              Financial institutions deploy automated credit underwriting models under the{" "}
              <strong className="text-ink font-medium">RBI Digital Lending Directions (2022)</strong>.
              Regulators and auditors cannot inspect internal neural network weights or private training data.
              FairLens India synthesizes matched counterfactual applicant pairs at API boundaries to expose bias
              with statistical rigor.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/auth/login">
                <Button className="h-11 bg-accent text-canvas hover:bg-accent-dim px-6 font-medium text-sm gap-2">
                  Launch Auditor Console
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="h-11 border-line bg-panel hover:bg-raised text-ink px-5 text-sm gap-2 font-mono">
                  Inspect Live Probes & Replays
                </Button>
              </Link>
            </div>

            {/* Regulatory Anchors */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-line text-xs">
              <div>
                <p className="font-mono text-muted text-[11px] uppercase tracking-wider">Directive</p>
                <p className="font-semibold text-ink mt-0.5">RBI Digital Lending</p>
                <p className="text-muted text-[11px]">Fair Practices Code</p>
              </div>
              <div>
                <p className="font-mono text-muted text-[11px] uppercase tracking-wider">Framework</p>
                <p className="font-semibold text-ink mt-0.5">FREE-AI (Trust)</p>
                <p className="text-muted text-[11px]">Explainability & Equity</p>
              </div>
              <div>
                <p className="font-mono text-muted text-[11px] uppercase tracking-wider">Attestation</p>
                <p className="font-semibold text-ink mt-0.5">SHA-256 Ledger</p>
                <p className="text-muted text-[11px]">HITL Auditor Certified</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Counterfactual Twin Preview Card */}
          <div className="lg:col-span-6">
            <div className="panel border border-line bg-panel p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-line">
                <div>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-accent" />
                    <h2 className="text-sm font-semibold text-ink">Interactive Counterfactual Twin Probe</h2>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Toggle protected variables below to observe black-box underwriting divergence.
                  </p>
                </div>
                <Badge variant={isApproved ? "ok" : "danger"}>
                  {isApproved ? "MODEL APPROVED" : "MODEL REJECTED"}
                </Badge>
              </div>

              {/* Applicant Base Profile (Constant Non-Protected Attributes) */}
              <div className="mt-5 rounded-lg border border-line bg-raised/50 p-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2">
                  Constant Underwriting Attributes (Matched Baseline)
                </div>
                <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
                  <div>
                    <span className="text-[11px] text-muted block">Annual Income</span>
                    <span className="font-mono font-medium text-ink tabular-nums text-sm">₹9,50,000</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted block">CIBIL Score</span>
                    <span className="font-mono font-medium text-ink tabular-nums text-sm text-emerald-600 dark:text-emerald-400">
                      775 (Prime)
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted block">Loan Requested</span>
                    <span className="font-mono font-medium text-ink tabular-nums text-sm">₹12,00,000</span>
                  </div>
                </div>
              </div>

              {/* Protected Variables Toggle Controls */}
              <div className="mt-5 space-y-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted">
                  Protected Variables (Click to Perturb & Probe)
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Gender Toggle */}
                  <div className="rounded-lg border border-line p-3 bg-panel">
                    <span className="text-xs font-medium text-muted block mb-2">Protected Attribute 1: Gender</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender("male")}
                        className={`rounded px-3 py-1.5 text-xs font-mono transition-colors ${
                          gender === "male"
                            ? "bg-accent text-canvas font-semibold"
                            : "bg-raised text-muted hover:text-ink border border-line"
                        }`}
                      >
                        Male (Baseline)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("female")}
                        className={`rounded px-3 py-1.5 text-xs font-mono transition-colors ${
                          gender === "female"
                            ? "bg-accent text-canvas font-semibold"
                            : "bg-raised text-muted hover:text-ink border border-line"
                        }`}
                      >
                        Female (Twin)
                      </button>
                    </div>
                  </div>

                  {/* Location / PIN Code Toggle */}
                  <div className="rounded-lg border border-line p-3 bg-panel">
                    <span className="text-xs font-medium text-muted block mb-2">Protected Attribute 2: Location</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPincodeGroup("urban")}
                        className={`rounded px-3 py-1.5 text-xs font-mono transition-colors ${
                          pincodeGroup === "urban"
                            ? "bg-accent text-canvas font-semibold"
                            : "bg-raised text-muted hover:text-ink border border-line"
                        }`}
                      >
                        Urban (500081)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPincodeGroup("rural")}
                        className={`rounded px-3 py-1.5 text-xs font-mono transition-colors ${
                          pincodeGroup === "rural"
                            ? "bg-accent text-canvas font-semibold"
                            : "bg-raised text-muted hover:text-ink border border-line"
                        }`}
                      >
                        Rural (509102)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Telemetry & Skeptic Alert Box */}
              <div className="mt-5 pt-4 border-t border-line">
                {isApproved ? (
                  <div className="rounded-lg border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/20 p-3.5 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-emerald-900 dark:text-emerald-300">
                        Baseline Profile: Approved with Standard Interest Rate
                      </p>
                      <p className="text-emerald-800/80 dark:text-emerald-400/80 mt-0.5">
                        Approval probability: <span className="font-mono tabular-nums font-semibold">91.4%</span>.
                        Debt-to-Income and creditworthiness satisfy model policy.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-red-600/30 bg-red-50 dark:bg-red-950/20 p-3.5 space-y-2">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold text-red-900 dark:text-red-300">
                          Disparate Rejection Detected on Identical Financial Merit
                        </p>
                        <p className="text-red-800/80 dark:text-red-400/80 mt-0.5">
                          Flipping {gender === "female" ? "Gender to Female" : "Location to Rural"} caused the model
                          to drop approval to <span className="font-mono tabular-nums font-semibold">18.2%</span>.
                        </p>
                      </div>
                    </div>

                    {/* Statistical Proof Pill Box */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-red-600/20 text-center font-mono text-[11px] tabular-nums">
                      <div className="bg-panel rounded py-1 px-2 border border-line">
                        <span className="text-muted block text-[9px] uppercase">Disparate Impact</span>
                        <span className="font-bold text-red-600 dark:text-red-400">DIR: 0.61</span>
                        <span className="text-[9px] text-muted block">&lt; 0.80 threshold</span>
                      </div>
                      <div className="bg-panel rounded py-1 px-2 border border-line">
                        <span className="text-muted block text-[9px] uppercase">McNemar Discord</span>
                        <span className="font-bold text-ink">b=142, c=2</span>
                        <span className="text-[9px] text-muted block">p &lt; 1e-12</span>
                      </div>
                      <div className="bg-panel rounded py-1 px-2 border border-line">
                        <span className="text-muted block text-[9px] uppercase">Skeptic Check</span>
                        <span className="font-bold text-red-600 dark:text-red-400">BIAS CONFIRMED</span>
                        <span className="text-[9px] text-muted block">6/6 checks passed</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Architecture Strip */}
        <section className="mt-20 pt-12 border-t border-line">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-accent">
              Tri-Pillar Audit Architecture
            </h2>
            <h3 className="text-2xl font-semibold text-ink mt-2">
              Autonomous Verification Without Model Weights
            </h3>
            <p className="text-sm text-muted mt-2">
              FairLens audits external model endpoints as pure black boxes through rigorous synthetic probing,
              adversarial agent cross-examination, and cryptographic ledger verification.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Pillar 1 */}
            <div className="panel border border-line bg-panel p-6 hover:border-accent/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                <Users className="h-5 w-5" />
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted">Pillar 01</div>
              <h4 className="text-base font-semibold text-ink mt-1">Counterfactual Twin Synthesis</h4>
              <p className="text-xs text-muted leading-relaxed mt-2">
                Generates high-dimensional applicant profiles holding CIBIL score, monthly salary, debt-to-income,
                and loan tenure mathematically invariant while selectively flipping protected proxy vectors.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-muted font-mono">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Gender & Community Proxies
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  PIN Code / Urban-Rural Demarcation
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Zero Income Drift Guarantee
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="panel border border-line bg-panel p-6 hover:border-accent/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted">Pillar 02</div>
              <h4 className="text-base font-semibold text-ink mt-1">4-Agent Statistical & Skeptic Gauntlet</h4>
              <p className="text-xs text-muted leading-relaxed mt-2">
                The Probe and Statistical Agents measure Disparate Impact and McNemar discordance.
                The Skeptic Agent rigorously tests for noise, small sample artifacts, and confounding before any claim is kept.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-muted font-mono">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Holm-Bonferroni Corrected p-values
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Income Quintile Subgroup Invariance
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Projected Wrongful Rejections / 10k
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="panel border border-line bg-panel p-6 hover:border-accent/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted">Pillar 03</div>
              <h4 className="text-base font-semibold text-ink mt-1">Tamper-Evident SHA-256 Ledger</h4>
              <p className="text-xs text-muted leading-relaxed mt-2">
                No report can be silently altered or deleted. Every finding, config hash, and accredited human auditor
                sign-off is minted into an unbroken SHA-256 cryptographic blockchain.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-muted font-mono">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Accredited Auditor License Binding
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Sequential Previous Block Hashing
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  One-Click Cryptographic Verification
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Auditor Portal Quick Entry */}
        <section className="mt-16 rounded-xl border border-line bg-raised/40 p-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Database className="h-4 w-4 text-accent" />
                <span className="font-mono text-xs text-muted uppercase tracking-wider">
                  Accredited Auditor Access
                </span>
              </div>
              <h3 className="text-xl font-semibold text-ink mt-1">
                Ready to execute an official model audit?
              </h3>
              <p className="text-xs text-muted mt-1 max-w-xl">
                Sign in to the FairLens Auditor Portal using your accredited credentials or choose a pre-seeded persona
                to inspect live streaming probes, replay recorded investigations, or verify the certificate ledger.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button
                onClick={() => {
                  loginAsPersona("AUDITOR").then(() => navigate("/"));
                }}
                className="bg-accent text-canvas hover:bg-accent-dim text-xs font-mono h-9 px-4 gap-1.5"
              >
                Sign In as Lead Auditor (Dr. Sen)
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Link to="/auth/login">
                <Button variant="outline" className="border-line bg-panel text-ink hover:bg-raised text-xs font-mono h-9 px-4">
                  All Roles & Credentials
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-line py-8 text-center text-xs text-muted font-mono">
        <div className="mx-auto max-w-[1400px] px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={18} />
            <span>FairLens India · Autonomous Black-Box Fairness Auditing</span>
          </div>
          <div className="flex items-center gap-6">
            <span>RBI FREE-AI Aligned</span>
            <span>Digital Lending Directions (2022)</span>
            <span>SHA-256 Verified Ledger</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
