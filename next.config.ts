import type { NextConfig } from "next";

// devIndicators: 개발 도구 버튼이 E2E의 getByRole("button") 검색과 충돌하지 않도록 끈다.
const nextConfig: NextConfig = { reactStrictMode: true, devIndicators: false };
export default nextConfig;
