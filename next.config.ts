import type { NextConfig } from "next";

// Workaround for Turbopack not loading env vars correctly from Google Drive paths
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nnmhozkcvisufhtjlboq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubWhvemtjdmlzdWZodGpsYm9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODkxMTIsImV4cCI6MjA4MDE2NTExMn0.l6vZG6iHQQlL0VPRww7WUi4wIKeMfPo62XptjqjNHK8';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  },
};

export default nextConfig;
