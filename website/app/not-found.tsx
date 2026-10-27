import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p>The documentation page may have moved.</p>
      <Link className="underline underline-offset-4" href="/docs/api">
        Browse the API reference
      </Link>
    </main>
  );
}
