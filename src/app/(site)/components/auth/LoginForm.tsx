"use client";

import { useState } from "react";
import { useLogin } from "@/hooks/useAuth";
import GoogleButton from "./GoogleButton";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const mutation = useLogin();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await mutation.mutateAsync({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err?.response?.data?.error ?? err?.message ?? "Login failed";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {msg && <div className="text-sm text-red-600">{msg}</div>}

      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="flex justify-between text-sm mt-2">
        <a href="/auth/register" className="text-blue-600 hover:underline">
          Create account
        </a>
        <a href="/auth/reset" className="text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>

      <div className="my-4 border-t border-gray-200" />
      <GoogleButton />
    </form>
  );
}
