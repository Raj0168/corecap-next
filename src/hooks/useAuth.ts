"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { setCookie, removeCookie } from "@/utils/cookies";
import { useAuthStore } from "@/store/authStore";
import { User, UserPopulated } from "@/types/interfaces";
import { queryClient } from "@/utils/react-query";

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
    onSuccess: async (payload: any) => {
      const token = pickToken(payload);
      const user: User | undefined =
        payload?.user ?? payload?.data?.user ?? undefined;

      if (token) setCookie("token", token);

      if (user) {
        setUser(user);
        queryClient.setQueryData(["me"], user);
      } else {
        try {
          const { data } = await api.get("/auth/me");
          setUser(data.user);
          queryClient.setQueryData(["me"], data.user);
        } catch (err) {
          console.warn("Failed to fetch /auth/me after login:", err);
        }
      }
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => api.post("/auth/logout").then((res) => res.data),
    onSuccess: () => {
      logout();
      removeCookie("token");
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    },
  });
};

export const useMe = () =>
  useQuery<UserPopulated, Error>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      const user = res.data.user;
      useAuthStore.getState().setUser(user);
      return user;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

export const useRegister = () =>
  useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      api.post("/auth/register", data).then((res) => res.data),
  });

export const useVerifyEmail = () =>
  useMutation({
    mutationFn: (data: { email: string; code: string }) =>
      api.post("/auth/verify-email", data).then((res) => res.data),
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (data: { email: string }) =>
      api.post("/auth/forgot-password", data).then((res) => res.data),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (data: { email: string; code: string; newPassword: string }) =>
      api.post("/auth/reset-password", data).then((res) => res.data),
  });
