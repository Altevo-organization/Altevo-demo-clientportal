import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Altévo — Portail Client",
  description: "Portail client sécurisé : documents, demandes, messages, historique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
