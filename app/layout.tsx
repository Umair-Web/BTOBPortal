import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ScrollRevealInitializer } from "./ScrollRevealInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "B2B E-commerce Portal",
  description: "B2B E-commerce Portal with Quotation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={inter.className}
      >
        <Providers>{children}</Providers>
        <ScrollRevealInitializer />
      </body>
    </html>
  );
}

