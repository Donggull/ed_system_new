/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 환경에서 환경변수 강제 로드
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // 환경변수 디버깅을 위한 webpack 설정
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      console.log('🔧 Next.js Build - Environment Variables Check:');
      console.log('  NODE_ENV:', process.env.NODE_ENV);
      console.log('  VERCEL_ENV:', process.env.VERCEL_ENV);
      console.log('  NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
      console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    }
    return config;
  },
}

module.exports = nextConfig
