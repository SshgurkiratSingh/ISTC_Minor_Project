import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import ClientPasscodeLock from "./ClientPasscode";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ISTC MINOR PROJECT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-black"}>
        <Providers>
          <ClientPasscodeLock>{children}</ClientPasscodeLock>
        </Providers>
      </body>
    </html>
  );
}
