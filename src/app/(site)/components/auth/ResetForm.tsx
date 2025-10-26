"use client";

import { useState } from "react";
import { useResetPassword } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Key, Lock, Eye, EyeOff, RefreshCw } from "lucide-react";
import Button from "../ui/button";
import { toastGlobal } from "../ui/toast";

export default function ResetForm({ email }: { email: string }) {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      toastGlobal({ type: "success", message: "Password reset successful!" });
      setTimeout(() => router.push("/auth/login"), 900);
    } catch (err: any) {
      const message =
        err?.response?.data?.error ?? err?.message ?? "Reset failed";
      toastGlobal({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {msg && <div className="text-sm text-red-600">{msg}</div>}

      <p className="text-sm">
        Enter code sent to <strong>{email}</strong> and your new password.
      </p>

      {/* Reset code */}
      <div className="relative">
        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Reset code"
          className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-[#FFD600] focus:outline-none"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>

      {/* New password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="New password"
          className="w-full pl-10 pr-10 p-3 border rounded-xl focus:ring-2 focus:ring-[#FFD600] focus:outline-none"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Reset button */}
      <Button
        type="submit"
        className="w-full flex items-center justify-center gap-2"
        loading={loading}
      >
        <RefreshCw size={20} />
        Reset password
      </Button>

      {/* Back to login */}
      <div className="text-sm mt-2 text-center">
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Back to Login
        </a>
      </div>
    </form>
  );
}
