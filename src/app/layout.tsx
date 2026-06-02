import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuildQ",
  description: "A visual query builder for nested database and API filters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
