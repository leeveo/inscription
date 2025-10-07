import { NextResponse } from 'next/server';
import { supabaseAuthenticatedApi } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    domainId: string;
  }>;
}

// PUT /api/builder/domains/[domainId] - Update a domain
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { domainId } = await params;
    const body = await request.json();
    const { is_primary } = body;

    const supabase = await supabaseAuthenticatedApi();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current domain to get site_id
    const { data: currentDomain, error: fetchError } = await supabase
      .from('builder_domains')
      .select('site_id, is_primary')
      .eq('id', domainId)
      .single();

    if (fetchError || !currentDomain) {
      return NextResponse.json(
        { success: false, message: 'Domain not found' },
        { status: 404 }
      );
    }

    // If setting as primary, unset other primary domains for this site
    if (is_primary && !currentDomain.is_primary) {
      await supabase
        .from('builder_domains')
        .update({ is_primary: false })
        .eq('site_id', currentDomain.site_id)
        .eq('is_primary', true);
    }

    // Update domain
    const { data: domain, error } = await supabase
      .from('builder_domains')
      .update({
        is_primary: is_primary !== undefined ? is_primary : currentDomain.is_primary,
        updated_at: new Date().toISOString()
      })
      .eq('id', domainId)
      .select()
      .single();

    if (error) {
      console.error('Error updating domain:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update domain', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      domain,
      message: 'Domain updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /api/builder/domains/[domainId]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/builder/domains/[domainId] - Delete a domain
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { domainId } = await params;
    const supabase = await supabaseAuthenticatedApi();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete domain
    const { error } = await supabase
      .from('builder_domains')
      .delete()
      .eq('id', domainId);

    if (error) {
      console.error('Error deleting domain:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete domain', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Domain deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/builder/domains/[domainId]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}