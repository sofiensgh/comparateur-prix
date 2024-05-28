import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FavoritesSidebar from "@/components/FavoritesSidebar";
import SlideBar from "@/components/SlideBar";
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FlashPrix",
  description:
    "Track product prices effortlessly and save money on your online shopping.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <main>
          <Navbar />
          <SlideBar />
          {/* <FavoritesSidebar /> */}

          {children}

          <Footer />
        </main>
      </body>
    </html>
  );
}
