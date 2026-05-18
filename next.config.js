/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker / ECS deployment — emits a self-contained server bundle
  output: 'standalone',

  // PWA-like headers for tablet kiosk mode
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
