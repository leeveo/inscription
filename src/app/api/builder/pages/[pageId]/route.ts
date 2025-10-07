import { NextResponse } from 'next/server';
import { supabaseApi, supabaseAuthenticatedApi } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface RouteParams {
  params: Promise<{
    pageId: string;
  }>;
}

// GET /api/builder/pages/[pageId] - Get a specific page
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { pageId } = await params;
    const supabase = supabaseApi();

    const { data: page, error } = await supabase
      .from('builder_pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (error || !page) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Error in GET /api/builder/pages/[pageId]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/builder/pages/[pageId] - Update a page
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { pageId } = await params;
    const body = await request.json();
    const { tree, status, name, slug, event_id } = body;

    // If updating event_id (assignment), use admin client
    const supabase = event_id !== undefined ? supabaseAdmin : await supabaseAuthenticatedApi();

    console.log('📝 DEBUG - API PUT /api/builder/pages/' + pageId);
    console.log('📝 DEBUG - Received body:', JSON.stringify(body, null, 2));
    console.log('📝 DEBUG - Tree type:', typeof tree);
    console.log('📝 DEBUG - Tree keys:', tree ? Object.keys(tree) : 'null');

    // Get user (skip auth check for admin operations like event_id assignment)
    let user = null;
    if (event_id === undefined) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Get current page
    const { data: currentPage } = await supabase
      .from('builder_pages')
      .select('version, tree')
      .eq('id', pageId)
      .single();

    if (!currentPage) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      );
    }

    // Create version snapshot if tree changed significantly
    if (tree && user && JSON.stringify(tree) !== JSON.stringify(currentPage.tree)) {
      await supabase.from('builder_page_versions').insert({
        page_id: pageId,
        version: currentPage.version,
        tree: currentPage.tree,
        created_by: user.id,
      });
    }

    // Update page
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (tree) updateData.tree = tree;
    if (status) updateData.status = status;
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (event_id !== undefined) updateData.event_id = event_id;

    // Increment version if tree changed
    if (tree) {
      updateData.version = currentPage.version + 1;
    }

    const { data: page, error } = await supabase
      .from('builder_pages')
      .update(updateData)
      .eq('id', pageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating page:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update page', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Error in PUT /api/builder/pages/[pageId]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/builder/pages/[pageId] - Partial update (e.g., name only)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { pageId } = await params;
    const supabase = await supabaseAuthenticatedApi();
    const body = await request.json();
    const { name } = body;

    console.log('📝 DEBUG - API PATCH /api/builder/pages/' + pageId);
    console.log('📝 DEBUG - Updating name to:', name);

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update only the provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;

    const { data: page, error } = await supabase
      .from('builder_pages')
      .update(updateData)
      .eq('id', pageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating page name:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update page', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Error in PATCH /api/builder/pages/[pageId]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/builder/pages/[pageId] - Delete a page
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { pageId } = await params;
    console.log('🗑️ API DELETE - Tentative de suppression de l\'ID:', pageId);

    if (!pageId) {
      console.log('🗑️ API DELETE - Erreur: ID manquant');
      return NextResponse.json(
        { success: false, message: 'ID manquant' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS restrictions
    const supabase = supabaseAdmin;

    // D'abord, vérifier si le formulaire existe
    const { data: existingPage, error: checkError } = await supabase
      .from('builder_pages')
      .select('id, name, event_id')
      .eq('id', pageId)
      .single();

    if (checkError) {
      console.log('🗑️ API DELETE - Erreur recherche:', checkError);
      if (checkError.code === 'PGRST116') {
        console.log('🗑️ API DELETE - Formulaire non trouvé (déjà supprimé?)');
        return NextResponse.json(
          { success: true, message: 'Formulaire déjà supprimé ou introuvable', deletedId: pageId },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recherche du formulaire' },
        { status: 500 }
      );
    }

    console.log('🗑️ API DELETE - Formulaire trouvé:', existingPage);

    // Supprimer la page du builder
    const { error, count } = await supabase
      .from('builder_pages')
      .delete({ count: 'exact' })
      .eq('id', pageId);

    if (error) {
      console.error('🗑️ API DELETE - Erreur lors de la suppression:', error);
      
      // Check if it's an auth/permission error
      if (error.message?.includes('permission') || error.code === 'PGRST301') {
        return NextResponse.json(
          { success: false, message: 'Unauthorized - insufficient permissions' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression du formulaire' },
        { status: 500 }
      );
    }

    console.log('🗑️ API DELETE - Suppression terminée:', {
      deletedId: pageId,
      rowsAffected: count,
      success: count && count > 0
    });

    // Vérifier que le formulaire a bien été supprimé
    const { data: verifyDeleted, error: verifyError } = await supabase
      .from('builder_pages')
      .select('id')
      .eq('id', pageId)
      .single();
    
    if (!verifyError || verifyError.code === 'PGRST116') {
      console.log('🗑️ API DELETE - Vérification: formulaire bien supprimé');
    } else {
      console.log('🗑️ API DELETE - Attention: formulaire peut-être encore présent:', verifyDeleted);
    }

    return NextResponse.json(
      { success: true, message: 'Formulaire supprimé avec succès', deletedId: pageId },
      { status: 200 }
    );

  } catch (error) {
    console.error('🗑️ API DELETE - Erreur serveur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
