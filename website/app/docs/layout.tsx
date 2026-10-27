import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '../../lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      containerProps={{ className: 'reference-frame' }}
      nav={{
        title: (
          <>
            <span className="reference-mark" aria-hidden="true">
              TF
            </span>
            <span>temporal-fns</span>
          </>
        ),
      }}
      githubUrl="https://github.com/Frantss/temporal-fns"
      links={[
        { text: 'npm', url: 'https://www.npmjs.com/package/@helpy/temporal-fns', external: true },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
