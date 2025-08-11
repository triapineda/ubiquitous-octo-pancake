// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Allow this site to be iframed by Notion
          { key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://www.notion.so https://notion.so https://*.notion.so https://*.notion.site" }
          // Do NOT set X-Frame-Options here. Leave it out entirely.
        ],
      },
    ];
  },
}
module.exports = nextConfig
