/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirect all requests to the event-admin build
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/event-admin/:path*',
      },
    ]
  },
  // Use the event-admin directory as the source
  distDir: './event-admin/.next',
}

module.exports = nextConfig