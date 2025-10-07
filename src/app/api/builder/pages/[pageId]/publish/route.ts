import { NextResponse } from 'next/server';
import { supabaseAuthenticatedApi } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    pageId: string;
  }>;
}

// POST /api/builder/pages/[pageId]/publish - Publish a page
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

    // Update page status to published
    const { data: page, error } = await supabase
      .from('builder_pages')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', pageId)
      .select()
      .single();

    if (error) {
      console.error('Error publishing page:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to publish page', error: error.message },
        { status: 500 }
      );
    }

    // TODO: Trigger ISR/SSG rebuild here
    // This will be implemented in Phase 5.1

    return NextResponse.json({
      success: true,
      page,
      message: 'Page published successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/builder/pages/[pageId]/publish:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
