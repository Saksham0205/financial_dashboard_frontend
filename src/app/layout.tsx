import type { Metadata } from "next";
import "./globals.css";
import KeepAlive from "@/components/KeepAlive";

export const metadata: Metadata = {
  title: "FinanceFlow — Dashboard",
  description: "Professional Finance Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-surface">
        <KeepAlive />
        {children}
      </body>
    </html>
  );
}
