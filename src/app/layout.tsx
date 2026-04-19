import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pokedex Helper",
  description: "Track your Pokemon Go collection — regular, shiny, XXL, and XXL shiny",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
