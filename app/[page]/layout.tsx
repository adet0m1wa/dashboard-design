import { notFound } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { isPage, PAGE_IDS } from '@/lib/pages';

// One persistent shell for all six pages. The URL decides the first page; after that the
// shell moves between pages itself (see AppShell > UrlSync).
export const dynamicParams = false;

export function generateStaticParams() {
  return PAGE_IDS.map((page) => ({ page }));
}

export default async function PageLayout({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (!isPage(page)) notFound();
  return <AppShell initialPage={page} />;
}
