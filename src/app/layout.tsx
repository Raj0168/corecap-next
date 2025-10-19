import "../styles/globals.css";
import { ReactNode } from "react";
import Providers from "./(site)/components/Providers";
import Header from "./(site)/components/layout/Header";
import Footer from "./(site)/components/layout/Footer";

export default function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal?: ReactNode;
}) {
  const isAdmin =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Providers>
          {!isAdmin && <Header />}
          <main className="flex-1">{children}</main>
          {!isAdmin && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
