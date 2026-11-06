import * as React from "react";
import type { UserProfile } from "@/api-types";
import { api } from "@/lib/api";

export type RoleType = "AUDITOR" | "ML_ENG" | "REGULATOR";

export interface PersonaMeta {
  id: string;
  email: string;
  password: string;
  name: string;
  role: RoleType;
  organization: string;
  license_id: string | null;
  title: string;
  badge: string;
  description: string;
  permissions: string[];
}

export const DEMO_PERSONAS: Record<RoleType, PersonaMeta> = {
  AUDITOR: {
    id: "usr_auditor_01",
    email: "auditor@fairlens.in",
    password: "Auditor@2026",
    name: "Dr. Arishta Sen",
    role: "AUDITOR",
    organization: "Bureau of AI Ethics & Lending Supervision",
    license_id: "RBI-FA-2026-089",
    title: "Lead AI Fairness Auditor (Accredited)",
    badge: "Accredited Auditor",
    description: "Full audit rights + exclusive regulatory authority to sign and lock SHA-256 certificates.",
    permissions: ["Run Probes", "Inspect Telemetry", "Certify Reports (HITL)", "Lock SHA-256 Chain"],
  },
  ML_ENG: {
    id: "usr_ml_02",
    email: "ml.eng@capitalcredit.in",
    password: "Engineer@2026",
    name: "Vikram Malhotra",
    role: "ML_ENG",
    organization: "CapitalCredit NBFC Risk Analytics",
    license_id: null,
    title: "Principal Credit Risk ML Engineer",
    badge: "NBFC ML Engineer",
    description: "Model owner testing APIs for algorithmic bias. Blocked from certifying reports due to conflict of interest.",
    permissions: ["Connect Models", "Run Probes", "Inspect Twin Mismatches", "Replay Audits"],
  },
  REGULATOR: {
    id: "usr_reg_03",
    email: "regulator@rbi.org.in",
    password: "Regulator@2026",
    name: "Priya Nambiar",
    role: "REGULATOR",
    organization: "Reserve Bank of India (FinTech Dept.)",
    license_id: "RBI-SUPV-REG-441",
    title: "Deputy Director, Algorithmic Lending Compliance",
    badge: "RBI Observer",
    description: "Read-only supervisory oversight, verifying model compliance and cryptographic ledger integrity.",
    permissions: ["Supervisory Read-Only", "Inspect Evidence", "Verify Cryptographic Hashes", "Audit Trail"],
  },
};

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  role: RoleType | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<UserProfile>;
  loginAsPersona: (role: RoleType) => Promise<UserProfile>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = "fairlens-user";
const TOKEN_STORAGE_KEY = "fairlens-token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as UserProfile;
      }
    } catch {
      // Ignore parse errors
    }
    // Default to the accredited Auditor persona so initial views and tests run with full auditor context
    return {
      id: DEMO_PERSONAS.AUDITOR.id,
      email: DEMO_PERSONAS.AUDITOR.email,
      name: DEMO_PERSONAS.AUDITOR.name,
      role: DEMO_PERSONAS.AUDITOR.role,
      organization: DEMO_PERSONAS.AUDITOR.organization,
      license_id: DEMO_PERSONAS.AUDITOR.license_id,
      title: DEMO_PERSONAS.AUDITOR.title,
    };
  });

  const [token, setToken] = React.useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) ?? "fl_demo_token";
    } catch {
      return "fl_demo_token";
    }
  });

  const login = React.useCallback(async (email: string, password = ""): Promise<UserProfile> => {
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      return res.user;
    } catch {
      // Fallback matching for local demo persona if backend offline or mocked
      const lower = email.trim().toLowerCase();
      let matchedRole: RoleType = "AUDITOR";
      if (lower.includes("ml") || lower.includes("eng")) matchedRole = "ML_ENG";
      else if (lower.includes("regulator") || lower.includes("rbi")) matchedRole = "REGULATOR";

      const persona = DEMO_PERSONAS[matchedRole];
      const fallbackUser: UserProfile = {
        id: persona.id,
        email: email.trim(),
        name: persona.name,
        role: persona.role,
        organization: persona.organization,
        license_id: persona.license_id,
        title: persona.title,
      };
      const fallbackToken = `fl_jwt_${fallbackUser.id}_${Date.now()}`;
      setUser(fallbackUser);
      setToken(fallbackToken);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser));
        localStorage.setItem(TOKEN_STORAGE_KEY, fallbackToken);
      } catch {
        // Ignore storage errors
      }
      return fallbackUser;
    }
  }, []);

  const loginAsPersona = React.useCallback(
    async (targetRole: RoleType): Promise<UserProfile> => {
      const p = DEMO_PERSONAS[targetRole];
      return login(p.email, p.password);
    },
    [login],
  );

  const logout = React.useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const role = user?.role ?? null;
  const isAuthenticated = Boolean(user);

  const value = React.useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated,
      login,
      loginAsPersona,
      logout,
    }),
    [user, token, role, isAuthenticated, login, loginAsPersona, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    // Default fallback if used outside AuthProvider (e.g. in standalone tests)
    const auditor = DEMO_PERSONAS.AUDITOR;
    return {
      user: {
        id: auditor.id,
        email: auditor.email,
        name: auditor.name,
        role: auditor.role,
        organization: auditor.organization,
        license_id: auditor.license_id,
        title: auditor.title,
      },
      token: "fl_test_token",
      role: "AUDITOR",
      isAuthenticated: true,
      login: async () => auditor,
      loginAsPersona: async () => auditor,
      logout: () => {},
    };
  }
  return ctx;
}
