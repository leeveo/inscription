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

    // Simulate DNS verification (in production, you'd use actual DNS lookup)
    // For now, we'll simulate the verification process
    const verificationResult = await simulateDNSVerification(domain.host, domain.type);

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

// Simulate DNS verification (in production, use actual DNS lookup)
async function simulateDNSVerification(host: string, type: string) {
  // Simulate DNS lookup delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // For demo purposes, simulate verification based on host pattern
  // In production, you'd use actual DNS lookup libraries
  const isVerified = host.includes('verified') || Math.random() > 0.3; // 70% success rate for demo

  return {
    dnsVerified: isVerified,
    dnsRecord: type === 'subdomain'
      ? { type: 'CNAME', name: host, value: process.env.NEXT_PUBLIC_APP_URL }
      : { type: 'A', name: host, value: '192.168.1.1' },
    message: isVerified
      ? 'DNS configuration is correct'
      : 'DNS record not found or incorrect. Please check your DNS settings.',
    checkedAt: new Date().toISOString()
  };
}