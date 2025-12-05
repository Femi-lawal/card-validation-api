import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecurePay - Premium Payment Gateway",
  description: "Fast, secure payment processing with fraud detection. Accept credit cards instantly with our modern payment gateway.",
  keywords: ["payment gateway", "credit card", "secure payments", "online payments"],
  authors: [{ name: "SecurePay" }],
  openGraph: {
    title: "SecurePay - Premium Payment Gateway",
    description: "Fast, secure payment processing with fraud detection",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a2e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
