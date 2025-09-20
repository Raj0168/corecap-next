import Cookies from "js-cookie";

export const setCookie = (key: string, value: string, days = 7) =>
  Cookies.set(key, value, { expires: days });

export const getCookie = (key: string) => Cookies.get(key);

export const removeCookie = (key: string) => Cookies.remove(key);
