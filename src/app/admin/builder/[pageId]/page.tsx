import BuilderEditor from '@/components/builder/BuilderEditor';
import { BuilderProvider } from '@/contexts/BuilderContext';
import { supabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    pageId: string;
  }>;
}

export default async function BuilderPage({ params }: PageProps) {
  const { pageId } = await params;

  // Fetch page from database
  const supabase = await supabaseServer();
  const { data: page, error } = await supabase
    .from('builder_pages')
    .select('*')
    .eq('id', pageId)
    .single();

  if (error || !page) {
    console.error('Error fetching page:', error);
    notFound();
  }

  console.log('Loaded page:', { id: page.id, name: page.name, hasTree: !!page.tree });

  return (
    <BuilderProvider>
      <BuilderEditor initialPage={page} />
    </BuilderProvider>
  );
}
