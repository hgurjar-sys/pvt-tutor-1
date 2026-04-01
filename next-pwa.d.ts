declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  interface PwaOptions {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    // adding other minimal options to avoid any type issues
    [key: string]: any;
  }

  function withPWAInit(options?: PwaOptions): (nextConfig: NextConfig) => NextConfig;
  export default withPWAInit;
}
