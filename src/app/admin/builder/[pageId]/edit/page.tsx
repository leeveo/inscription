import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import BuilderEditor from '@/components/builder/BuilderEditor';

interface EditPageProps {
  params: Promise<{
    pageId: string;
  }>;
}

export default async function EditBuilderPage({ params }: EditPageProps) {
  const { pageId } = await params;

  // Vérifier si la page existe
  const supabase = await supabaseServer();
  const { data: page, error } = await supabase
    .from('builder_pages')
    .select('*')
    .eq('id', pageId)
    .single();

  if (error || !page) {
    console.error('Page not found:', pageId, error);
    redirect('/admin/builder/library');
  }

  // Rediriger vers la route principale sans /edit
  redirect(`/admin/builder/${pageId}`);
}