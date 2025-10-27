"use client";

import { useState } from "react";
import { useLogin } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Button from "../ui/button";
import { toastGlobal } from "../ui/toast";
import GoogleButton from "./GoogleButton";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const mutation = useLogin();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await mutation.mutateAsync({ email, password });
      toastGlobal({ type: "success", message: "Login successful!" });
      router.push("/my-courses");
    } catch (err: any) {
      const message =
        err?.response?.data?.error ?? err?.message ?? "Login failed";
      toastGlobal({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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

      {/* Login button */}
      <Button
        type="submit"
        className="w-full flex items-center justify-center gap-2"
        loading={loading}
      >
        <LogIn size={20} />
        Login
      </Button>

      {/* Links */}
      <div className="flex justify-between text-sm mt-2">
        <a href="/auth/register" className="text-blue-600 hover:underline">
          Create account
        </a>
        <a href="/auth/reset" className="text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>

      {/* Divider + Google Button */}
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
