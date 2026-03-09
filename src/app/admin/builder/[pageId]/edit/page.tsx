import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import BuilderEditor from '@/components/builder/BuilderEditor';

interface EditPageProps {
  params: Promise<{
    pageId: string;
  }>;
}

export default async function EditBuilderPage({ params }: EditPageProps) {
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
    console.error('Page not found:', pageId, error);
    redirect('/admin/builder/library');
  }

  // Rediriger vers la route principale sans /edit
  redirect(`/admin/builder/${pageId}`);
}