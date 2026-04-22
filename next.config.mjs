/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "*.supabase.co" }
    ]
  },
  async redirects() {
    return [
      {
        source: "/explorar",
        destination: "/search",
        permanent: true
      }
    ];
  }
};

export default nextConfig;