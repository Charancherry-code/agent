import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import UserSync from "@/components/UserSync"; // Ensure this matches your folder structure

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Agent Builder",
  description: "Build Custom AI Agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          {/* UserSync runs inside the provider to handle user saving */}
          <UserSync />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
