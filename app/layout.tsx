import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Svolta - The Turning Point",
  description: "Professional before/after fitness photo alignment using AI pose detection. Create stunning progress comparisons with perfect alignment.",
  keywords: ["fitness", "before after", "photo alignment", "pose detection", "progress tracking", "transformation"],
  authors: [{ name: "Svolta" }],
  metadataBase: new URL("https://svolta.app"),
  openGraph: {
    title: "Svolta - The Turning Point",
    description: "Professional before/after fitness photo alignment using AI pose detection.",
    url: "https://svolta.app",
    siteName: "Svolta",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Svolta - The Turning Point",
    description: "Professional before/after fitness photo alignment using AI pose detection.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
