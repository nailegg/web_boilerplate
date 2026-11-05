import type { NextConfig } from "next";

// devIndicators: 개발 도구 버튼이 화면 검사와 충돌하지 않도록 끈다.
// distDir: `pnpm build`는 NEXT_DIST_DIR=.next-build로 실행된다. dev 서버가 쓰는 .next를 덮어쓰지 않아 build 중에도 dev 서버가 깨지지 않는다.
const nextConfig: NextConfig = { reactStrictMode: true, devIndicators: false, distDir: process.env.NEXT_DIST_DIR ?? ".next" };
export default nextConfig;
