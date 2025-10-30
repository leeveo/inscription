import { NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    domain: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { domain } = await params;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking domain: ${domain}`);

    // Nettoyer le domaine (enlever www. si présent)
    const cleanDomain = domain.replace(/^www\./, '');

    const supabase = supabaseApi();

    // Vérifier si le domaine existe dans builder_domains
    const { data: domainRecord, error: domainError } = await supabase
      .from('builder_domains')
      .select('*')
      .eq('host', cleanDomain)
      .single();

    if (domainError || !domainRecord) {
      console.log(`❌ Domain not found: ${domain}`);
      return NextResponse.json({
        authorized: false,
        reason: 'Domain not found or inactive',
        domain: cleanDomain
      });
    }

    // Vérifier si le DNS est configuré correctement
    if (domainRecord.dns_status !== 'verified') {
      console.log(`⚠️ Domain DNS not verified: ${domain}`);
      return NextResponse.json({
        authorized: false,
        reason: 'Domain DNS not verified',
        domain: cleanDomain,
        dnsStatus: domainRecord.dns_status
      });
    }

    // Vérifier si la page associée est publiée
    const { data: page, error: pageError } = await supabase
      .from('builder_pages')
      .select('*')
      .eq('site_id', domainRecord.site_id)
      .eq('status', 'published')
      .single();

    if (pageError || !page) {
      console.log(`❌ No published page for domain: ${domain}`);
      return NextResponse.json({
        authorized: false,
        reason: 'No published page found',
        domain: cleanDomain
      });
    }

    console.log(`✅ Domain authorized: ${domain} -> page ${page.slug}`);

    return NextResponse.json({
      authorized: true,
      domain: cleanDomain,
      page: {
        id: page.id,
        slug: page.slug,
        name: page.name
      },
      domainRecord: {
        id: domainRecord.id,
        dnsStatus: domainRecord.dns_status,
        sslStatus: domainRecord.ssl_status
      }
    });

  } catch (error) {
    console.error('Error checking domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}