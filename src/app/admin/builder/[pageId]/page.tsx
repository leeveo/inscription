import BuilderEditor from '@/components/builder/BuilderEditor';
import { BuilderProvider } from '@/contexts/BuilderContext';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    pageId: string;
  }>;
}

export default async function BuilderPage({ params }: PageProps) {
  const { pageId } = await params;

  // Use service role to bypass RLS - authorization is handled by /admin middleware
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

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
