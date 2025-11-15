/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Backend media (development)
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/**' },
      // Optional LAN backend
      { protocol: 'http', hostname: '192.168.1.73', port: '8000', pathname: '/**' },
      // Unsplash CDN
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      // Optional additional CDNs
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.pexels.com', pathname: '/**' },
      // Google encrypted thumbnails (e.g. https://encrypted-tbn0.gstatic.com/images?...)
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com', pathname: '/**' },
      // Google user content (Drive/Photos thumbnails)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      // Gadgetbyte CDN (requested)
      { protocol: 'https', hostname: 'cdn.gadgetbytenepal.com', pathname: '/**' },
      // Common e-commerce/CDN hosts
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
      { protocol: 'https', hostname: 'm.media-amazon.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.imgur.com', pathname: '/**' },
      // Popular headless CMS/CDNs
      { protocol: 'https', hostname: 'images.ctfassets.net', pathname: '/**' },
      { protocol: 'https', hostname: 'media.graphassets.com', pathname: '/**' },
      // Google Cloud/Firebase storage
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/**' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/**' },
      //
      
    ],
  },
};

module.exports = nextConfig;