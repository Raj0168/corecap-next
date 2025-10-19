import { cookies } from "next/headers";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminAuth from "../components/admin/AdminAuth";

export default async function AdminPage() {
  const cookieStore = cookies() as unknown as ReadonlyRequestCookies;
  const isAdmin = cookieStore.get("isAdmin")?.value === "true";

  if (isAdmin) {
    const adminName = cookieStore.get("adminName")?.value || "Admin";
    return <AdminDashboard name={adminName} />;
  }

  return <AdminAuth />;
}
