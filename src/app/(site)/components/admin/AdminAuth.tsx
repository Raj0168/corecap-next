"use client";

import { useState } from "react";
import { useAdminLogin, useAdminRegister } from "@/hooks/useAdminAuth";

export default function AdminAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const loginMutation = useAdminLogin();
  const registerMutation = useAdminRegister();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ name, email, password, secret });
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-gray-100 shadow-xl rounded-lg mt-10 border-t-4 border-blue-500">
      <div className="flex justify-center mb-6 space-x-4">
        <button
          className={`px-6 py-3 rounded-full font-semibold transition-colors duration-300 ${
            !isRegistering
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-300 text-gray-700"
          }`}
          onClick={() => setIsRegistering(false)}
        >
          Login
        </button>
        <button
          className={`px-6 py-3 rounded-full font-semibold transition-colors duration-300 ${
            isRegistering
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-300 text-gray-700"
          }`}
          onClick={() => setIsRegistering(true)}
        >
          Register
        </button>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-inner">
        {isRegistering ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Secret Code"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-3 rounded-lg font-bold shadow-lg hover:bg-green-700 transition duration-300"
            >
              Register Admin
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition duration-300"
            >
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
