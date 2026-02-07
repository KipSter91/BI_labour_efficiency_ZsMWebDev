"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { AuthGate } from "./AuthGate";
import { LanguageProvider } from "./LanguageProvider";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AuthGate>{children}</AuthGate>
      </AuthProvider>
    </LanguageProvider>
  );
}
