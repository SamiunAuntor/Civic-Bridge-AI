import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Inter } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const headingFont = Atkinson_Hyperlegible({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: false,
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Civic Bridge AI",
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
      className={`${headingFont.variable} ${bodyFont.variable} light h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body
        className="min-h-full bg-[#f5f7fd] text-[#0b1c30]"
        style={{ backgroundColor: "#f5f7fd", color: "#0b1c30" }}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
