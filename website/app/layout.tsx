import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Provider } from './provider';
import './global.css';

export const metadata: Metadata = {
  title: { default: 'temporal-fns', template: '%s | temporal-fns' },
  description:
    'Date-fns-style utilities for Temporal. Installation, API examples, and behavior specifications.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
