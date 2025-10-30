import { NextResponse } from 'next/server';
import { supabaseAuthenticatedApi } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    pageId: string;
  }>;
}

// POST /api/builder/pages/[pageId]/duplicate - Duplicate a page
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { pageId } = await params;
    const supabase = await supabaseAuthenticatedApi();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get original page
    const { data: originalPage, error: fetchError } = await supabase
      .from('builder_pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (fetchError || !originalPage) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      );
    }

    // Create duplicate with new name and slug
    const timestamp = Date.now();
    const { data: duplicatePage, error: createError } = await supabase
      .from('builder_pages')
      .insert({
        site_id: originalPage.site_id,
        template_id: originalPage.template_id,
        name: `${originalPage.name} (Copie)`,
        slug: `${originalPage.slug}-copy-${timestamp}`,
        tree: originalPage.tree,
        status: 'draft', // Always create as draft
        version: 1,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error duplicating page:', createError);
      return NextResponse.json(
        { success: false, message: 'Failed to duplicate page', error: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      page: duplicatePage,
      message: 'Page duplicated successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/builder/pages/[pageId]/duplicate:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
