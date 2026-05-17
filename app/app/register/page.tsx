import { AuthEntry } from "@/components/auth-entry";
import { getApiRuntimeConfig } from "@/lib/api";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string | string[] }>;
}) {
  const { base } = getApiRuntimeConfig();
  const params = await searchParams;
  const nextHref =
    typeof params?.next === "string" ? params.next : "/app/dashboard";
  return <AuthEntry mode="register" apiBase={base} nextHref={nextHref} />;
}
