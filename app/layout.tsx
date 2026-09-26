import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comment cleanup · Jev",
  description: "Compare Jev and an LLM on making code comments more useful.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
