import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oddly — Estudio de tecnología digital",
  description:
    "Convertimos información dispersa, intuiciones y complejidad en productos digitales con una estructura visible. Primero el patrón. Después el diseño."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
