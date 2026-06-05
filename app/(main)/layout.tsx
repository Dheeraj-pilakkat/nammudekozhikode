import type { Metadata } from "next";
import "@/app/globals.css";
import Header from "@/app/components/ui/Header";
import Footer from "@/app/components/ui/Footer";

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
    <html lang="en">
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
