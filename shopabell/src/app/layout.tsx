import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "ShopAbell - Transform Your Live Selling Business",
  description: "The all-in-one platform that helps social media sellers turn live streams into sales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-text-primary bg-background-white`}>
        {children}
      </body>
    </html>
  );
}
