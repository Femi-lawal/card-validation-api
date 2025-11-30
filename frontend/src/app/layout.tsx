import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payment Gateway Simulator",
  description: "Secure payment processing with fraud detection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
