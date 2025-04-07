import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Life OS",
  description:
    "Your personal operating system for daily organization and productivity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
