import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LicitHub - Agregador de Licitações',
  description: 'Encontre as melhores oportunidades de licitações públicas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}