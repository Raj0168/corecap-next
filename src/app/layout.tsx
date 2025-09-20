import "../styles/globals.css";
import { ReactNode } from "react";
import Providers from "./(site)/components/Providers";
import Header from "./(site)/components/layout/Header";
import Footer from "./(site)/components/layout/Footer";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
