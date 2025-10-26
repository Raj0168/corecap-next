"use client";

import { ReactNode, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/react-query";
import { useAuthStore } from "@/store/authStore";

interface ProvidersProps {
  children: ReactNode;
  initialUser?: any;
}

export default function Providers({ children, initialUser }: ProvidersProps) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
