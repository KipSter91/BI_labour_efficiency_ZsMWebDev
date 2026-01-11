"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  ReactNode,
} from "react";

// Pre-hashed password: "labeff2026" -> SHA-256
// You can generate a new hash at: https://emn178.github.io/online-tools/sha256.html
const VALID_PASSWORD_HASH =
  "2bda68243a31b3e6207c41bdadee1169961bbfe397730aa7277ecac172fff18d";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Helper to read sessionStorage without hydration mismatch
function getStoredAuth(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("labeff_auth") === "true";
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use useSyncExternalStore to avoid setState in useEffect
  const storedAuth = useSyncExternalStore(
    subscribeToStorage,
    getStoredAuth,
    () => false // Server snapshot
  );

  const [isAuthenticated, setIsAuthenticated] = useState(storedAuth);

  const login = async (password: string): Promise<boolean> => {
    const hashedInput = await hashPassword(password);
    if (hashedInput === VALID_PASSWORD_HASH) {
      setIsAuthenticated(true);
      sessionStorage.setItem("labeff_auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("labeff_auth");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
