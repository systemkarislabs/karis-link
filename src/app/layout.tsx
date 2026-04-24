import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karis Link | Plataforma",
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
