/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Next 16 only allows quality values listed here. We use 95 for the crisp
    // profile photo; 75 is the default used elsewhere.
    qualities: [75, 95],
  },
};

export default nextConfig;
