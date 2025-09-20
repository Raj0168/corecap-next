"use client";

import { useState } from "react";
import { useResetPassword } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ResetForm({ email }: { email: string }) {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mutation = useResetPassword();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await mutation.mutateAsync({ email, code, newPassword });
      setMsg("Password reset successful. Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 900);
    } catch (err: any) {
      const message =
        err?.response?.data?.error ?? err?.message ?? "Reset failed";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {msg && <div className="text-sm text-red-600">{msg}</div>}

      <p className="text-sm">
        Enter code sent to <strong>{email}</strong> and your new password.
      </p>

      <input
        type="text"
        placeholder="Reset code"
        className="w-full p-2 border rounded"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="New password"
        className="w-full p-2 border rounded"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full py-2 bg-yellow-700 text-white rounded"
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset password"}
      </button>

      <div className="text-sm mt-2">
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Back to Login
        </a>
      </div>
    </form>
  );
}
