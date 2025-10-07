import BuilderLibrary from '@/components/builder/BuilderLibrary';
import { supabaseServer } from '@/lib/supabase/server';
import type { BuilderPage, BuilderTemplate } from '@/types/builder';

export default async function BuilderLibraryPage() {
  const supabase = await supabaseServer();

  // Fetch user's pages
  let pages: BuilderPage[] = [];
  try {
    const { data: pagesData, error: pagesError } = await supabase
      .from('builder_pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!pagesError && pagesData) {
      pages = pagesData as BuilderPage[];
    }
  } catch (error) {
    console.error('Error fetching pages:', error);
  }

  // Fetch all templates (public + user)
  let templates: BuilderTemplate[] = [];
  try {
    const { data: templatesData, error: templatesError } = await supabase
      .from('builder_templates')
      .select('*')
      .order('is_public', { ascending: false }) // Public templates first
      .order('created_at', { ascending: false });

    if (!templatesError && templatesData) {
      templates = templatesData as BuilderTemplate[];
    } else if (templatesError) {
      console.error('Error fetching templates:', templatesError);
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
  }

  return (
    <BuilderLibrary
      initialPages={pages}
      initialTemplates={templates}
    />
  );
}
