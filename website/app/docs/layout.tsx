import type { ReactNode } from 'react';
import { DocsBrand, DocsLayout } from '@frantss/fumadocs-theme';
import { source } from '../../lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: <DocsBrand mark="TF">temporal-fns</DocsBrand>,
      }}
      githubUrl="https://github.com/Frantss/temporal-fns"
      links={[
        { text: 'npm', url: 'https://www.npmjs.com/package/@frantss/temporal-fns', external: true },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
