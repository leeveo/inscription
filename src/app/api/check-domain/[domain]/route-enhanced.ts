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
        { 
          authorized: false,
          error: 'Domain parameter is required',
          reason: 'Invalid request'
        },
        { status: 400 }
      );
    }

    console.log(`🔍 [ENHANCED] Checking domain: ${domain}`);

    // Nettoyer le domaine (enlever www. si présent)
    const cleanDomain = domain.replace(/^www\./, '');
    const supabase = supabaseApi();

    // Utiliser la nouvelle fonction pour vérifier toute la chaîne
    const { data: checkResult, error: checkError } = await supabase
      .rpc('check_domain_complete_chain', { domain_host: cleanDomain });

    if (checkError) {
      console.error('❌ Database error:', checkError);
      return NextResponse.json({
        authorized: false,
        reason: 'Database error',
        domain: cleanDomain,
        error: checkError.message
      }, { status: 500 });
    }

    if (!checkResult || checkResult.length === 0) {
      console.log(`❌ Domain not found: ${cleanDomain}`);
      return NextResponse.json({
        authorized: false,
        reason: 'Domain not found in system',
        domain: cleanDomain,
        debug: {
          cleanDomain,
          originalDomain: domain,
          timestamp: new Date().toISOString()
        }
      });
    }

    const result = checkResult[0];

    // Log détaillé pour debug
    console.log(`📊 Domain check result:`, {
      domain: cleanDomain,
      authorized: result.authorized,
      reason: result.reason,
      pageSlug: result.page_slug,
      eventId: result.event_id,
      dnsStatus: result.dns_status,
      sslStatus: result.ssl_status
    });

    if (!result.authorized) {
      console.log(`⚠️  Domain not authorized: ${cleanDomain} - ${result.reason}`);
      return NextResponse.json({
        authorized: false,
        reason: result.reason,
        domain: cleanDomain,
        debug: {
          dnsStatus: result.dns_status,
          sslStatus: result.ssl_status,
          pageSlug: result.page_slug,
          eventId: result.event_id
        }
      });
    }

    // Domaine autorisé !
    console.log(`✅ Domain authorized: ${cleanDomain} -> page ${result.page_slug}`);

    return NextResponse.json({
      authorized: true,
      domain: cleanDomain,
      page: {
        id: result.page_id,
        slug: result.page_slug,
        name: `Page for ${cleanDomain}` // Pourrait être amélioré avec le vrai nom
      },
      domainRecord: {
        id: result.domain_id,
        dnsStatus: result.dns_status,
        sslStatus: result.ssl_status
      },
      event: {
        id: result.event_id
      },
      debug: {
        siteId: result.site_id,
        checkTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Critical error in domain check:', error);
    return NextResponse.json({
      authorized: false,
      error: 'Internal server error',
      reason: 'System error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Nouvelle route pour diagnostics
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { domain } = await params;
    const { action } = await request.json();

    if (action === 'diagnose') {
      const supabase = supabaseApi();
      const cleanDomain = domain.replace(/^www\./, '');

      // Diagnostic complet
      const { data: diagnostic, error } = await supabase
        .from('v_domain_status')
        .select('*')
        .eq('domain_host', cleanDomain)
        .single();

      if (error) {
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        diagnostic,
        recommendations: generateRecommendations(diagnostic)
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

function generateRecommendations(diagnostic: any): string[] {
  const recommendations = [];

  if (diagnostic.overall_status === 'DNS_ISSUE') {
    recommendations.push('Configurez les enregistrements DNS selon les instructions fournies');
    recommendations.push('Vérifiez que votre domaine pointe vers les bons serveurs');
  }

  if (diagnostic.overall_status === 'PAGE_NOT_PUBLISHED') {
    recommendations.push('Publiez votre page depuis l\'interface d\'administration');
    recommendations.push('Vérifiez le contenu de votre page avant publication');
  }

  if (diagnostic.overall_status === 'EVENT_INACTIVE') {
    recommendations.push('Activez votre événement dans les paramètres');
    recommendations.push('Vérifiez les dates de votre événement');
  }

  if (recommendations.length === 0) {
    recommendations.push('Votre configuration semble correcte');
    recommendations.push('Si le problème persiste, contactez le support');
  }

  return recommendations;
}