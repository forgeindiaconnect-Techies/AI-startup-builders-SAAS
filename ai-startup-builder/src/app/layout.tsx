import type { Metadata } from "next";
import "./globals.css";
import { AuthProviderWrapper } from "./providers";

export const metadata: Metadata = {
  title: "AI Startup Builder - Build Your AI Startup From Idea to Scale",
  description:
    "The all-in-one platform for founders, mentors, and investors. Leverage AI to create pitch decks, business plans, and connect with the right people.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}
