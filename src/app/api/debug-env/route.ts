import { NextResponse } from 'next/server'

// Endpoint de debug pour vérifier les variables d'environnement en production
// ⚠️ À SUPPRIMER après debug pour la sécurité
export async function GET() {
  try {
    // Variables publiques (safe à exposer)
    const publicVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'DÉFINI' : 'MANQUANT',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `DÉFINI (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...)` : 'MANQUANT',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'MANQUANT',
      NEXT_PUBLIC_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_PUBLIC_BASE_URL || 'MANQUANT (utilise valeur par défaut)',
    }
    
    // Variables secrètes (ne pas exposer la valeur)
    const secretVars = {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? `DÉFINI (${process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20)}...)` : 'MANQUANT',
    }
    
    // Variables calculées
    const computed = {
      publicBaseUrlUsed: process.env.NEXT_PUBLIC_PUBLIC_BASE_URL || 'https://waivent.app',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    }
    
    return NextResponse.json({
      status: 'DEBUG - Variables d\'environnement',
      publicVariables: publicVars,
      secretVariables: secretVars,
      computedValues: computed,
      warning: '⚠️ CET ENDPOINT DOIT ÊTRE SUPPRIMÉ APRÈS DEBUG'
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Erreur lors de la vérification des variables',
      details: error.message
    }, { status: 500 })
  }
}