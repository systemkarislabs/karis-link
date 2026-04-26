import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karis Link | Plataforma",
  icons: {
    icon: [
      { url: "/karis-favicon.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2", sizes: "any" },
    ],
    apple: "/apple-icon.png?v=2",
  },
  description: "Gestão inteligente de links",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        {children}
      </body>
    </html>
  );
}
