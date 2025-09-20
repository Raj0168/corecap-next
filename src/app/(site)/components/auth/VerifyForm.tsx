"use client";

import { useState } from "react";
import { useVerifyEmail } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function VerifyForm({
  email,
  onSuccess,
}: {
  email: string;
  onSuccess?: () => void;
}) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mutation = useVerifyEmail();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await mutation.mutateAsync({ email, code });
      setMsg("Email verified. Redirecting to login...");
      onSuccess?.();
      setTimeout(() => router.push("/auth/login"), 900);
    } catch (err: any) {
      const message =
        err?.response?.data?.error ?? err?.message ?? "Verification failed";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {msg && <div className="text-sm text-red-600">{msg}</div>}

      <p className="text-sm">
        Enter the OTP sent to <strong>{email}</strong>
      </p>

      <input
        type="text"
        placeholder="6-digit code"
        className="w-full p-2 border rounded"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 py-2 bg-green-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
        <a
          href="/auth/register"
          className="flex-1 inline-flex items-center justify-center py-2 bg-gray-100 rounded text-sm"
        >
          Back
        </a>
      </div>
    </form>
  );
}
