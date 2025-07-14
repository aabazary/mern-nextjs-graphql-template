import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", 
});

export const metadata: Metadata = {
  title: "Template App", 
  description: "PERN stack template with Next.js, GraphQL, Prisma, JWT, Bcrypt, and TailwindCSS", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]`}>
        <Providers>
          {/* Navigation */}
          <Navbar />
          
          {/* Page content */}
          <main className="flex-grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}