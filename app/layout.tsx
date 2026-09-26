import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./LanguageContext";
import GoogleTranslate from "./GoogleTranslate";

export const metadata: Metadata = {
  title: "CityCare",
  description: "Smart Civic Complaint Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <GoogleTranslate />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}