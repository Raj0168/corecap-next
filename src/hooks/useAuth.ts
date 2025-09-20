"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { setCookie, removeCookie } from "@/utils/cookies";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types/interfaces";

function pickToken(payload: any) {
  return (
    payload?.token ?? payload?.accessToken ?? payload?.access_token ?? null
  );
}

export const useLogin = () => {
const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post("/auth/login", data).then((res) => res.data),
    onSuccess: (payload: any) => {
      const token = pickToken(payload);
      const user: User | undefined =
        payload?.user ?? payload?.data?.user ?? undefined;

      if (token) setCookie("token", token);
      if (user) setUser(user);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      api.post("/auth/register", data).then((res) => res.data),
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (data: { email: string; code: string }) =>
      api.post("/auth/verify-email", data).then((res) => res.data),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      api.post("/auth/forgot-password", data).then((res) => res.data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string; code: string; newPassword: string }) =>
      api.post("/auth/reset-password", data).then((res) => res.data),
  });
};

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  return useMutation({
    mutationFn: () => api.post("/auth/logout").then((res) => res.data),
    onSuccess: () => {
      removeCookie("token");
      logout();
    },
  });
};

export const useMe = () =>
  useQuery<User>({
    queryKey: ["me"],
    queryFn: () => api.get("/auth/me").then((res) => res.data),
    // You might want to set initialData from cookie-based SSR user if you provide it
  });
