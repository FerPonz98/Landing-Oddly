const isDev = process.env.NODE_ENV !== 'production';

// 'unsafe-inline' en script-src cubre los scripts en línea de layout.tsx (tema, intro y JSON-LD) y los de Next.
// 'unsafe-eval' solo en desarrollo: `next dev` lo necesita para el hot reload.
// Al sumar un servicio externo (analytics, píxeles, embeds), permitir su dominio aquí o el navegador lo bloqueará.
const contentSecurityPolicy = [
  "default-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // Browsers still ask for /favicon.ico on their own; serve the app icon instead of a 404.
  async rewrites() {
    return [{ source: '/favicon.ico', destination: '/icon.png' }];
  },
};

export default nextConfig;
