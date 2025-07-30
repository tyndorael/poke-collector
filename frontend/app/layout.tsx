import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';

import { ActiveThemeProvider } from '@/components/active-theme';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { META_THEME_COLORS, siteConfig } from '@/lib/config';
import { fontVariables } from '@/lib/fonts';

import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
                if (localStorage.layout) {
                  document.documentElement.classList.add('layout-' + localStorage.layout)
                }
              } catch (_) {}
            `,
          }}
        />
        <meta name="theme-color" content={META_THEME_COLORS.light} />
      </head>
      <body
        className={cn(
          'text-foreground group/body overscroll-none font-sans antialiased [--footer-height:calc(var(--spacing)*14)] [--header-height:calc(var(--spacing)*14)] xl:[--footer-height:calc(var(--spacing)*24)]',
          fontVariables,
        )}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ActiveThemeProvider>
              {children}
              <Toaster />
            </ActiveThemeProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
