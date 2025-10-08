import { NextResponse } from 'next/server';
import { supabaseAuthenticatedApi } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    domainId: string;
  }>;
}

// POST /api/builder/domains/[domainId]/verify - Verify DNS configuration
export async function POST(request: Request, { params }: RouteParams) {
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

    // Get domain details
    const { data: domain, error: fetchError } = await supabase
      .from('builder_domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (fetchError || !domain) {
      return NextResponse.json(
        { success: false, message: 'Domain not found' },
        { status: 404 }
      );
    }

    // Perform real DNS verification
    const verificationResult = await performDNSVerification(domain.host, domain.type);

    // Update domain status based on verification result
    const { data: updatedDomain, error: updateError } = await supabase
      .from('builder_domains')
      .update({
        dns_status: verificationResult.dnsVerified ? 'verified' : 'failed',
        ssl_status: verificationResult.dnsVerified ? 'provisioning' : 'pending',
        verified_at: verificationResult.dnsVerified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', domainId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating domain status:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to update domain status', error: updateError.message },
        { status: 500 }
      );
    }

    // If DNS is verified, simulate SSL provisioning
    if (verificationResult.dnsVerified) {
      setTimeout(async () => {
        try {
          await supabase
            .from('builder_domains')
            .update({
              ssl_status: 'active'
            })
            .eq('id', domainId);
        } catch (error) {
          console.error('Error updating SSL status:', error);
        }
      }, 5000); // Simulate 5 second SSL provisioning
    }

    return NextResponse.json({
      success: true,
      domain: updatedDomain,
      verification: verificationResult,
      message: verificationResult.dnsVerified
        ? 'DNS verified successfully! SSL certificate is being provisioned.'
        : 'DNS verification failed. Please check your DNS configuration.'
    });
  } catch (error) {
    console.error('Error in POST /api/builder/domains/[domainId]/verify:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Real DNS verification using DNS lookup
async function performDNSVerification(host: string, type: string) {
  try {
    console.log(`🔍 Vérification DNS pour ${host} (type: ${type})`);

    // Check if we're in development environment
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      console.log('⚠️ Mode développement détecté, utilisation de la simulation DNS');
      return simulateDNSVerificationForDev(host, type);
    }

    // Use Node.js dns module for actual DNS lookup in production
    const { promises: dns } = await import('dns');

    let dnsRecord;
    let dnsVerified = false;
    let expectedValue;

    if (type === 'subdomain') {
      expectedValue = new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://admin.waivent.app').hostname;

      try {
        // Try to resolve CNAME record
        const result = await dns.resolveCname(host);
        dnsRecord = { type: 'CNAME', name: host, value: result[0] };
        dnsVerified = result[0] === expectedValue || result[0].includes(expectedValue);
        console.log(`✅ CNAME trouvé: ${result[0]} (attendu: ${expectedValue})`);
      } catch (cnameError) {
        console.log(`❌ CNAME non trouvé, essai avec A record...`);

        // Try A record as fallback
        try {
          const result = await dns.resolve4(host);
          dnsRecord = { type: 'A', name: host, value: result[0] };
          dnsVerified = false; // Should be CNAME, not A
          console.log(`⚠️ A record trouvé au lieu de CNAME: ${result[0]}`);
        } catch (aError) {
          console.log(`❌ Aucun enregistrement trouvé pour ${host}`);
        }
      }
    } else {
      // For custom domains, expect A record pointing to Vercel
      expectedValue = '76.76.21.21'; // Vercel IP

      try {
        const result = await dns.resolve4(host);
        dnsRecord = { type: 'A', name: host, value: result[0] };
        dnsVerified = result[0] === expectedValue;
        console.log(`✅ A record trouvé: ${result[0]} (attendu: ${expectedValue})`);
      } catch (error) {
        console.log(`❌ A record non trouvé pour ${host}`);
      }
    }

    return {
      dnsVerified,
      dnsRecord,
      expectedValue,
      message: dnsVerified
        ? 'DNS configuration is correct'
        : `DNS record not found or incorrect. Expected: ${expectedValue}`,
      checkedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Erreur lors de la vérification DNS:', error);
    console.error('Stack trace:', error.stack);

    return {
      dnsVerified: false,
      dnsRecord: null,
      message: `DNS verification failed: ${error.message}`,
      checkedAt: new Date().toISOString()
    };
  }
}

// Fallback simulation for development environment
function simulateDNSVerificationForDev(host: string, type: string) {
  console.log(`🔧 Simulation DNS pour ${host} en développement`);

  const expectedValue = type === 'subdomain'
    ? 'admin.waivent.app'
    : '76.76.21.21';

  return {
    dnsVerified: false,
    dnsRecord: null,
    expectedValue,
    message: `DNS verification simulated in development. Expected: ${expectedValue}`,
    checkedAt: new Date().toISOString(),
    isDevelopment: true
  };
}