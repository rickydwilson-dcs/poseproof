'use client';

import { ThemeProvider } from './ThemeProvider';
import { UserProvider } from './UserProvider';
import { MediaPipeProvider } from './MediaPipeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserProvider>
        <MediaPipeProvider>{children}</MediaPipeProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
