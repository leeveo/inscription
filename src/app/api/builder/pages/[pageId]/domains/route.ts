import { NextResponse } from 'next/server';
import { supabaseAuthenticatedApi } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    pageId: string;
  }>;
}

// GET /api/builder/pages/[pageId]/domains - Get domains for a page
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { pageId } = await params;
    const supabase = await supabaseAuthenticatedApi();
    const { searchParams } = new URL(request.url);
    const includeVerification = searchParams.get('includeVerification') === 'true';

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get page with site info
    const { data: page, error: pageError } = await supabase
      .from('builder_pages')
      .select('site_id, slug, status')
      .eq('id', pageId)
      .single();

    if (pageError || !page) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      );
    }

    // Get domains for this site
    const { data: domains, error } = await supabase
      .from('builder_domains')
      .select('*')
      .eq('site_id', page.site_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching domains:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch domains', error: error.message },
        { status: 500 }
      );
    }

    // If verification details requested, add DNS verification info
    let enhancedDomains = domains || [];
    if (includeVerification && domains) {
      enhancedDomains = domains.map(domain => ({
        ...domain,
        dnsVerification: getDNSVerificationInfo(domain.type, domain.host),
        sslVerification: getSSLVerificationInfo(domain.host)
      }));
    }

    return NextResponse.json({
      success: true,
      domains: enhancedDomains,
      page: {
        id: pageId,
        slug: page.slug,
        status: page.status,
        saasUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/p/${page.slug}`
      }
    });
  } catch (error) {
    console.error('Error in GET /api/builder/pages/[pageId]/domains:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/builder/pages/[pageId]/domains - Add a new domain
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { pageId } = await params;
    const body = await request.json();
    const { type, host } = body;

    if (!type || !host) {
      return NextResponse.json(
        { success: false, message: 'Domain type and host are required' },
        { status: 400 }
      );
    }

    if (!['subdomain', 'custom'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Domain type must be subdomain or custom' },
        { status: 400 }
      );
    }

    const supabase = await supabaseAuthenticatedApi();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get page with site info
    const { data: page, error: pageError } = await supabase
      .from('builder_pages')
      .select('site_id')
      .eq('id', pageId)
      .single();

    if (pageError || !page) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      );
    }

    // Check if domain already exists
    const { data: existingDomain } = await supabase
      .from('builder_domains')
      .select('id')
      .eq('host', host)
      .single();

    if (existingDomain) {
      return NextResponse.json(
        { success: false, message: 'Domain already exists' },
        { status: 409 }
      );
    }

    // Create new domain
    const { data: domain, error } = await supabase
      .from('builder_domains')
      .insert({
        site_id: page.site_id,
        type,
        host,
        dns_status: 'pending',
        ssl_status: 'pending',
        is_primary: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating domain:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create domain', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      domain: {
        ...domain,
        dnsVerification: getDNSVerificationInfo(type, host),
        sslVerification: getSSLVerificationInfo(host)
      },
      message: 'Domain added successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/builder/pages/[pageId]/domains:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get DNS verification info
function getDNSVerificationInfo(type: string, host: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'localhost:3001';

  if (type === 'subdomain') {
    return {
      type: 'CNAME',
      name: host,
      value: baseUrl,
      description: `Créez un enregistrement CNAME qui pointe "${host}" vers "${baseUrl}"`
    };
  } else {
    return {
      type: 'A',
      name: host,
      value: 'VOTRE_IP_SERVEUR', // À configurer avec l'IP réelle du serveur
      description: `Créez un enregistrement A qui pointe "${host}" vers l'IP de votre serveur`
    };
  }
}

// Helper function to get SSL verification info
function getSSLVerificationInfo(host: string) {
  return {
    type: 'SSL',
    description: `Un certificat SSL sera automatiquement provisionné pour ${host} une fois le DNS vérifié`,
    autoProvision: true
  };
}