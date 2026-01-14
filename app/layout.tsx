import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Wallet Connection Dashboard | Web3 Demo",
  description:
    "A production-quality Web3 dashboard for connecting to MetaMask, viewing account balances, and managing network connections on Ethereum Sepolia testnet.",
  keywords: [
    "Web3",
    "Ethereum",
    "MetaMask",
    "Wallet",
    "Dashboard",
    "DApp",
    "Sepolia",
    "Blockchain",
  ],
  authors: [{ name: "Web3 Developer" }],
  openGraph: {
    title: "Wallet Connection Dashboard",
    description: "Connect your MetaMask wallet and view your Ethereum account details",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-900 text-white`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
