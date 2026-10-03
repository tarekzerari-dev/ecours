import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_DEV_BYPASS_RLS_KEY: process.env.NODE_ENV === 'development' ? process.env.SUPABASE_SERVICE_ROLE_KEY : '',
  }
};

export default nextConfig;
