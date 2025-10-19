"use client";

import { useMutation } from "@tanstack/react-query";
import api from "@/utils/api";
import { setCookie, removeCookie } from "@/utils/cookies";
import { useAdminStore } from "@/store/adminStore";

// Admin login
export const useAdminLogin = () => {
  const setAdmin = useAdminStore((s) => s.setAdmin);

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post("/admin/login", data).then((res) => res.data),
    onSuccess: (payload) => {
      setCookie("token", payload.token);
      setAdmin(true);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.error || "Login failed");
    },
  });
};

// Admin register
export const useAdminRegister = () => {
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password: string;
      secret: string;
    }) => api.post("/admin/register", data).then((res) => res.data),
    onSuccess: () => alert("Admin registered successfully!"),
    onError: (err: any) =>
      alert(err?.response?.data?.error || "Registration failed"),
  });
};

// Admin logout
export const useAdminLogout = () => {
  const logout = useAdminStore((s) => s.logout);
  return () => {
    removeCookie("token");
    logout();
  };
};
