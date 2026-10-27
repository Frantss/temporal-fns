import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import defaultComponents, { createRelativeLink } from 'fumadocs-ui/mdx';
import { source } from '../../../lib/source';

type Props = { params: Promise<{ slug?: string[] }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const Content = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      className="reference-page"
      tableOfContent={{ enabled: false }}
      footer={{ className: 'reference-pagination' }}
    >
      <DocsTitle className="reference-title">{page.data.title}</DocsTitle>
      <DocsDescription className="reference-description">{page.data.description}</DocsDescription>
      <DocsBody className="reference-prose">
        <Content components={{ ...defaultComponents, a: createRelativeLink(source, page) }} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}
