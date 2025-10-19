import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-100 min-h-screen flex items-start justify-center p-10">
      <div className="w-full max-w-4xl">{children}</div>
    </div>
  );
}
