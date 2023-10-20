import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import ClientPasscodeLock from "./ClientPasscode";
import ClientOnly from "./Components/clientOnly";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ISTC MINOR PROJECT",
  description: "Website made by students of ISTC for Minor Project",
};

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className + " bg-black"}>
//         <Providers>
//           <ClientOnly>
//             <ClientPasscodeLock>{children}</ClientPasscodeLock>
//           </ClientOnly>
//         </Providers>
//       </body>
//     </html>
//   );
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-black"}>
        <Providers>
          <ClientOnly>{children}</ClientOnly>
        </Providers>
      </body>
    </html>
  );
}
