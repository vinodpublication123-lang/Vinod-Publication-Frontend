import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { Preloader } from "@/components/ui/Preloader";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VINVERSE | Premium Publishing Platform",
  description:
    "A premium publishing platform for writers ready to shape their manuscript into a professionally published book with editorial care, design precision, and meaningful reach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <AuthProvider>
          <Preloader />
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(8, 14, 26, 0.8)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fff",
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
