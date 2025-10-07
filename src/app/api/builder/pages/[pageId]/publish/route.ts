import { NextResponse } from 'next/server';
import { supabaseAuthenticatedApi } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    pageId: string;
  }>;
}

// POST /api/builder/pages/[pageId]/publish - Publish or unpublish a page
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { pageId } = await params;
    const body = await request.json();
    const { status = 'published' } = body;
    const supabase = await supabaseAuthenticatedApi();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate status
    if (!['draft', 'published'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be "draft" or "published"' },
        { status: 400 }
      );
    }

    // Update page status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'published') {
      updateData.published_at = new Date().toISOString();
    }

    const { data: page, error } = await supabase
      .from('builder_pages')
      .update(updateData)
      .eq('id', pageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating page status:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update page status', error: error.message },
        { status: 500 }
      );
    }

    // TODO: Trigger ISR/SSG rebuild here for published pages
    // This will be implemented in Phase 5.1

    return NextResponse.json({
      success: true,
      page,
      message: status === 'published' ? 'Page published successfully' : 'Page unpublished successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/builder/pages/[pageId]/publish:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
