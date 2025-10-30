import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// GET /api/builder/pages - List all pages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    let query = supabaseAdmin
      .from('builder_pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data: pages, error } = await query;

    if (error) {
      console.error('Error fetching pages:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch pages', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, pages });
  } catch (error) {
    console.error('Error in GET /api/builder/pages:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/builder/pages - Create a new page
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, siteId, templateId } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Create or get default site
    let finalSiteId = siteId;
    if (!finalSiteId) {
      // Create a default site
      const { data: existingSite } = await supabaseAdmin
        .from('builder_sites')
        .select('id')
        .limit(1)
        .single();

      if (existingSite) {
        finalSiteId = existingSite.id;
      } else {
        const { data: newSite, error: siteError } = await supabaseAdmin
          .from('builder_sites')
          .insert({
            name: 'Site par défaut',
            site_slug: `site-${Date.now()}`,
            status: 'draft',
          })
          .select()
          .single();

        if (siteError) {
          console.error('Error creating default site:', siteError);
          return NextResponse.json(
            { success: false, message: 'Failed to create default site', error: siteError.message },
            { status: 500 }
          );
        }

        finalSiteId = newSite.id;
      }
    }

    // Get template if provided
    let initialTree = {
      rootNodeId: 'root',
      nodes: {
        root: {
          type: { resolvedName: 'Container' },
          isCanvas: true,
          props: { background: '#ffffff', padding: 20, margin: 0 },
          displayName: 'Container',
          custom: {},
          hidden: false,
          nodes: [],
          linkedNodes: {},
        },
      },
    };

    if (templateId) {
      const { data: template } = await supabaseAdmin
        .from('builder_templates')
        .select('schema')
        .eq('id', templateId)
        .single();

      if (template) {
        initialTree = template.schema;
      }
    }

    // Create page
    const { data: page, error: pageError } = await supabaseAdmin
      .from('builder_pages')
      .insert({
        site_id: finalSiteId,
        template_id: templateId || null,
        name,
        slug,
        tree: initialTree,
        status: 'draft',
        version: 1,
    })
      .select()
      .single();

    if (pageError) {
      console.error('Error creating page:', pageError);
      return NextResponse.json(
        { success: false, message: 'Failed to create page', error: pageError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/builder/pages:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
