import { toastGlobal } from "../app/(site)/components/ui/toast";

export const toast = (t: {
  type: "success" | "error" | "warning";
  message: string;
}) => {
  toastGlobal(t);
};
export { toastGlobal };

