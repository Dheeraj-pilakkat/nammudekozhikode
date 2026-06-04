import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nammude Nagaram",
  description: "Kozhikode Civic Reporter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable}`}
    >
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header/>
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer/>
        </div>
      </body>
    </html>
  );
}
