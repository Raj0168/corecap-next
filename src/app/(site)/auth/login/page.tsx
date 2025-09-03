"use client";

import { useState } from "react";

type Mode = "login" | "register" | "verify" | "forgot" | "reset";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Helper for fetch with JSON & credentials included (cookies)
  async function api(path: string, body: any) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({ error: "Invalid JSON" }));
    return { ok: res.ok, status: res.status, data };
  }

  async function handleRegister(e?: React.FormEvent) {
    e?.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const { ok, data } = await api("/api/auth/register", {
        name,
        email,
        password,
      });
      if (ok) {
        setMsg("OTP sent to your email. Enter the code to verify.");
        setMode("verify");
      } else {
        setMsg(data?.error || "Registration failed");
      }
    } catch (err: any) {
      setMsg(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e?: React.FormEvent) {
    e?.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const { ok, data } = await api("/api/auth/verify-email", {
        email,
        code: otp,
      });
      if (ok) {
        setMsg("Email verified. Please login using your credentials.");
        setMode("login");
        setOtp("");
        setPassword("");
      } else {
        setMsg(data?.error || "Verification failed");
      }
    } catch (err: any) {
      setMsg(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const { ok, data } = await api("/api/auth/login", { email, password });
      if (ok) {
        // cookies set by backend; redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        setMsg(data?.error || "Login failed");
      }
    } catch (err: any) {
      setMsg(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e?: React.FormEvent) {
    e?.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const { ok, data } = await api("/api/auth/forgot-password", { email });
      if (ok) {
        setMsg("Reset code sent to your email. Enter it with a new password.");
        setMode("reset");
      } else {
        setMsg(data?.error || "Failed to send reset code");
      }
    } catch (err: any) {
      setMsg(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e?: React.FormEvent) {
    e?.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const { ok, data } = await api("/api/auth/reset-password", {
        email,
        code: otp,
        newPassword,
      });
      if (ok) {
        setMsg("Password reset. You can now login with the new password.");
        setMode("login");
        setOtp("");
        setNewPassword("");
      } else {
        setMsg(data?.error || "Reset failed");
      }
    } catch (err: any) {
      setMsg(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    // Use your backend start route which sets state cookie and redirects to Google
    window.location.href = "/api/auth/oauth/google/start";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          {mode === "register"
            ? "Register"
            : mode === "verify"
            ? "Verify Email"
            : mode === "forgot"
            ? "Forgot Password"
            : mode === "reset"
            ? "Reset Password"
            : "Login"}
        </h1>

        {msg && <div className="mb-3 text-sm text-red-600">{msg}</div>}

        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              className="w-full p-2 border rounded"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="w-full p-2 border rounded"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="w-full py-2 bg-blue-600 text-white rounded"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Login"}
            </button>
            <div className="flex justify-between text-sm mt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setMsg(null);
                }}
                className="text-blue-600"
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setMsg(null);
                }}
                className="text-blue-600"
              >
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="w-full p-2 border rounded"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="w-full p-2 border rounded"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="w-full py-2 bg-green-600 text-white rounded"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Register & Send OTP"}
            </button>
            <div className="text-sm mt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMsg(null);
                }}
                className="text-blue-600"
              >
                Already have an account? Login
              </button>
            </div>
          </form>
        )}

        {mode === "verify" && (
          <form onSubmit={handleVerify} className="space-y-3">
            <p className="text-sm">
              Enter the OTP sent to <strong>{email}</strong>
            </p>
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 bg-green-600 text-white rounded"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button
                type="button"
                className="flex-1 py-2 bg-gray-200 rounded"
                onClick={() => {
                  setMode("register");
                  setMsg(null);
                }}
              >
                Back
              </button>
            </div>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-3">
            <input
              className="w-full p-2 border rounded"
              type="email"
              placeholder="Enter your account email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              className="w-full py-2 bg-yellow-600 text-white rounded"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset code"}
            </button>
            <div className="text-sm mt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMsg(null);
                }}
                className="text-blue-600"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handleReset} className="space-y-3">
            <p className="text-sm">
              Enter the reset code sent to <strong>{email}</strong>
            </p>
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="Reset code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <input
              className="w-full p-2 border rounded"
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              className="w-full py-2 bg-yellow-700 text-white rounded"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
            <div className="text-sm mt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMsg(null);
                }}
                className="text-blue-600"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        <div className="mt-6">
          <button
            onClick={handleGoogle}
            className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
