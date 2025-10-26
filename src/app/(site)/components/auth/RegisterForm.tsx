"use client";

import { useState } from "react";
import { useRegister } from "@/hooks/useAuth";
import GoogleButton from "./GoogleButton";
import VerifyForm from "./VerifyForm";
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from "lucide-react";
import Button from "../ui/button";
import { toastGlobal } from "../ui/toast";

export default function RegisterForm() {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
      toastGlobal({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  if (step === "verify") {
    return <VerifyForm email={email} onSuccess={() => setStep("register")} />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {msg && <div className="text-sm text-red-600">{msg}</div>}

      {/* Name */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Full Name"
          className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-[#FFD600] focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="email"
          placeholder="Email"
          className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-[#FFD600] focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full pl-10 pr-10 p-3 border rounded-xl focus:ring-2 focus:ring-[#FFD600] focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

      {/* Register button */}
      <Button
        type="submit"
        className="w-full flex items-center justify-center gap-2"
        loading={loading}
      >
        <UserPlus size={20} />
        Register
      </Button>

      {/* Links */}
      <p className="text-sm mt-2 text-center">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Login
        </a>
      </p>

      {/* Divider + Google */}
      <div className="flex items-center justify-center gap-3 my-5">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          or continue with
        </span>
        <GoogleButton />
        <div className="flex-1"></div>
      </div>
    </form>
  );
}
