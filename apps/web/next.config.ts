import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@repo/shared',
    'until-async',
    '@mswjs/interceptors',
    'msw',
    'strict-event-emitter',
    'headers-polyfill',
    'outvariant',
    'better-auth',
  ],
};

export default nextConfig;
