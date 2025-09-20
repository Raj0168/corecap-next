"use client";

import { useState } from "react";
import { useRegister } from "@/hooks/useAuth";
import GoogleButton from "./GoogleButton";
import VerifyForm from "./VerifyForm";

export default function RegisterForm() {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mutation = useRegister();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await mutation.mutateAsync({ name, email, password });
      setMsg("OTP sent to your email. Please enter the code to verify.");
      setStep("verify");
    } catch (err: any) {
      const message =
        err?.response?.data?.error ?? err?.message ?? "Registration failed";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  }

  if (step === "verify") {
    return <VerifyForm email={email} onSuccess={() => setStep("register")} />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {msg && <div className="text-sm text-red-600">{msg}</div>}

      <input
        type="text"
        placeholder="Full name"
        className="w-full p-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
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
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      <p className="text-sm mt-2 text-center">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Login
        </a>
      </p>

      <div className="my-4 border-t border-gray-200" />
      <GoogleButton />
    </form>
  );
}
