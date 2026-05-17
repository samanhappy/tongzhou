import type { ReactNode } from "react";
import { AuthSessionProvider } from "@/components/auth-session-context";
import { fetchAuthMe, getApiRuntimeConfig } from "@/lib/api";

export default async function CreatorAreaLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await fetchAuthMe();
  const { base } = getApiRuntimeConfig();

  return (
    <AuthSessionProvider apiBase={base} initialSession={session}>
      {children}
    </AuthSessionProvider>
  );
}
