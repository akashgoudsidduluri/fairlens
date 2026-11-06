import * as React from "react";
import { Link, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { BookOpen, ClipboardList, Hash, Lock, Moon, Sun } from "lucide-react";

import { Logo, Wordmark } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton, LoadingLine, Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

const Welcome = React.lazy(() =>
  import("@/pages/Welcome").then((module) => ({ default: module.Welcome })),
);
const AuthPage = React.lazy(() =>
  import("@/pages/AuthPage").then((module) => ({ default: module.AuthPage })),
);
const Landing = React.lazy(() =>
  import("@/pages/Landing").then((module) => ({ default: module.Landing })),
);
const Arena = React.lazy(() =>
  import("@/pages/Arena").then((module) => ({ default: module.Arena })),
);
const Replay = React.lazy(() =>
  import("@/pages/Replay").then((module) => ({ default: module.Replay })),
);
const Certificates = React.lazy(() =>
  import("@/pages/Certificates").then((module) => ({
    default: module.Certificates,
  })),
);
const Evidence = React.lazy(() =>
  import("@/pages/Evidence").then((module) => ({ default: module.Evidence })),
);

function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-16">
      <LoadingLine>loading the arena…</LoadingLine>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <Skeleton className="mt-4 h-64 w-full" />
    </div>
  );
}

function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-md border border-accent/50 bg-canvas px-3 py-2 font-mono text-[11px] text-accent focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50"
    >
      skip to content
    </a>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-raised px-2.5 font-mono text-[10px] text-muted hover:border-accent/45 hover:text-ink transition-colors"
      title={`Switch to ${theme === "light" ? "Terminal Dark" : "Editorial Light"}`}
    >
      {theme === "light" ? (
        <>
          <Moon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <Sun className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </button>
  );
}

function AuthStatusBadge() {
  const { user } = useAuth();
  if (!user) {
    return (
      <Link
        to="/auth/login"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-raised px-2.5 font-mono text-[10px] text-muted hover:border-accent/45 hover:text-accent transition-colors"
      >
        <Lock className="h-3 w-3" />
        Sign in
      </Link>
    );
  }
  return (
    <Link
      to="/auth/login"
      className="inline-flex h-8 items-center gap-2 rounded-md border border-line bg-raised/80 px-2.5 font-mono text-[10px] text-ink hover:border-accent/45 transition-colors"
      title={`Logged in as ${user.name} (${user.role}). Click to switch persona.`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      <span className="font-medium truncate max-w-[110px]">{user.name.split(" ")[0]}</span>
      <Badge
        variant={user.role === "AUDITOR" ? "accent" : "outline"}
        className="text-[9px] py-0 px-1"
      >
        {user.role}
      </Badge>
    </Link>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-canvas text-ink transition-colors duration-150">
      <SkipLink />
      <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-3 rounded-lg py-1">
            <Logo size={28} />
            <Wordmark />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/welcome"
              className="hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1 font-mono text-[10px] text-muted transition-colors hover:border-accent/45 hover:text-accent sm:inline-flex"
            >
              <BookOpen className="h-3 w-3" aria-hidden="true" />
              overview
            </Link>
            <Link
              to="/evidence"
              className="hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1 font-mono text-[10px] text-muted transition-colors hover:border-accent/45 hover:text-accent sm:inline-flex"
            >
              <ClipboardList className="h-3 w-3" aria-hidden="true" />
              evidence
            </Link>
            <Link
              to="/certificates"
              className="hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1 font-mono text-[10px] text-muted transition-colors hover:border-accent/45 hover:text-accent sm:inline-flex"
            >
              <Hash className="h-3 w-3" aria-hidden="true" />
              audit records
            </Link>
            <Badge variant="accent">v4 · probe arena</Badge>
            <ThemeToggle />
            <AuthStatusBadge />
          </div>
        </div>
      </header>
      <main id="main">
        <React.Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/auth/login" element={<AuthPage />} />
            <Route path="/audit/:auditId" element={<Arena />} />
            <Route path="/replay/:replayId" element={<Replay />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/evidence" element={<Evidence />} />
          </Routes>
        </React.Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
          <TooltipProvider delayDuration={180}>
            <AppContent />
          </TooltipProvider>
        </MotionConfig>
      </AuthProvider>
    </ThemeProvider>
  );
}
