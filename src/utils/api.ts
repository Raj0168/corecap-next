// utils/api.ts
import axios from "axios";
import { toastGlobal } from "../app/(site)/components/ui/toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://corecapmaths.in/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      toastGlobal({ type: "error", message: "You need to login" });
      if (typeof window !== "undefined") window.location.href = "/auth/login";
    } else if (status === 404) {
      if (typeof window !== "undefined") window.location.href = "/404";
    } else if (status >= 500) {
      if (typeof window !== "undefined") window.location.href = "/500";
    } else {
      toastGlobal({
        type: "error",
        message: error.response?.data?.error || error.message,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
