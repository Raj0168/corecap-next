"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json();
        if (res.ok && json.ok) {
          setUser(json.user);
        } else {
          // unauthorized -> redirect to login
          window.location.href = "/auth/login";
        }
      } catch (err) {
        console.error(err);
        window.location.href = "/auth/login";
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/auth/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <p>Loading...</p>
          ) : user ? (
            <div className="p-4 border rounded bg-gray-50">
              <h2 className="font-semibold mb-2">Your details</h2>
              <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
            </div>
          ) : (
            <p>No user data.</p>
          )}
        </div>
      </div>
    </div>
  );
}
