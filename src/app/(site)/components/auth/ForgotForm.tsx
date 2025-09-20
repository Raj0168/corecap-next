"use client";

import { useState } from "react";
import { useForgotPassword } from "@/hooks/useAuth";
import ResetForm from "./ResetForm";

export default function ForgotForm() {
  const [step, setStep] = useState<"forgot" | "reset">("forgot");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mutation = useForgotPassword();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await mutation.mutateAsync({ email });
      setMsg("Reset code sent. Enter code and new password.");
      setStep("reset");
    } catch (err: any) {
      const message =
        err?.response?.data?.error ??
        err?.message ??
        "Failed to send reset code";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  }

  if (step === "reset") {
    return <ResetForm email={email} />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {msg && <div className="text-sm text-red-600">{msg}</div>}

      <p className="text-sm text-gray-600">
        Enter the email associated with your account and we'll send a reset
        code.
      </p>

      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full py-2 bg-yellow-600 text-white rounded"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send reset code"}
      </button>

      <div className="text-sm mt-2">
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Back to Login
        </a>
      </div>
    </form>
  );
}
