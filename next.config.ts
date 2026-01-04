import type { NextConfig } from "next";

// Workaround for Turbopack not loading env vars correctly from Google Drive paths
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nnmhozkcvisufhtjlboq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubWhvemtjdmlzdWZodGpsYm9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODkxMTIsImV4cCI6MjA4MDE2NTExMn0.l6vZG6iHQQlL0VPRww7WUi4wIKeMfPo62XptjqjNHK8';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload' // 2 years
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Script: Allow inline scripts for next-themes FOUC prevention + unsafe-eval for Fabric.js
              // Note: next-themes requires inline script to prevent flash of unstyled content
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.supabase.co https://cdn.jsdelivr.net https://vercel.live",
              // Style: Allow inline for Tailwind + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.stripe.com wss://*.supabase.co https://cdn.jsdelivr.net",
              "frame-src https://js.stripe.com https://checkout.stripe.com",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

export default nextConfig;
