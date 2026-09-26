import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jev · Keep the context",
  description:
    "Jev helps preserve the why behind your code. Explore comment cleanup with a Jev and Codex demo.",
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
