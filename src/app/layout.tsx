import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EverCart - Your Premium E-Commerce Store",
  description: "Shop the latest products with EverCart - Fast, secure, and reliable online shopping experience",
  keywords: "ecommerce, shopping, online store, products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-ambient min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
