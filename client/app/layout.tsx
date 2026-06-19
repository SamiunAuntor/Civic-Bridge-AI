import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Inter } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const headingFont = Atkinson_Hyperlegible({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicBridge AI",
  description: "AI-assisted crisis support and stability planning platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
