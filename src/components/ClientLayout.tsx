"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { AuthGate } from "./AuthGate";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
