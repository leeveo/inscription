import { NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = supabaseApi();

    // Exécuter la migration SQL directement avec .rpc()
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE builder_pages
        ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'landing_page';

        UPDATE builder_pages
        SET page_type = 'landing_page'
        WHERE page_type IS NULL;
      `
    });

    // Si exec_sql n'existe pas, utiliser une autre approche
    if (error && error.message.includes('function exec_sql')) {
      // Tenter d'utiliser la méthode directe avec le client Supabase admin
      try {
        // Créer un client admin avec les droits nécessaires
        const { data: adminData, error: adminError } = await supabase
          .from('builder_pages')
          .select('id')
          .limit(1);

        if (adminError) {
          throw adminError;
        }

        // Si la table existe, essayer de mettre à jour directement
        return NextResponse.json({
          success: true,
          message: 'Table builder_pages accessible. Veuillez exécuter manuellement dans Supabase SQL Editor:',
          sql: `ALTER TABLE builder_pages ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'landing_page';`
        });
      } catch (tableError) {
        return NextResponse.json({
          success: false,
          error: 'La table builder_pages n\'existe pas ou accès refusé',
          details: tableError.message,
          sql: `CREATE TABLE builder_pages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            event_id UUID REFERENCES inscription_evenements(id),
            tree JSONB,
            page_type TEXT DEFAULT 'landing_page',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );`
        });
      }
    }

    if (error) {
      console.error('Migration error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to execute migration',
          details: error.message,
          sql: `ALTER TABLE builder_pages ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'landing_page';`
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Migration executed successfully - page_type column added'
    });

  } catch (error) {
    console.error('Erreur serveur lors de la migration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur lors de la migration',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        sql: `ALTER TABLE builder_pages ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'landing_page';`
      },
      { status: 500 }
    );
  }
}