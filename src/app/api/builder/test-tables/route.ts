import { NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = supabaseApi();

    // Test each table
    const tables = [
      'builder_sites',
      'builder_templates',
      'builder_pages',
      'builder_page_versions',
      'builder_blocks_library',
      'builder_domains',
    ];

    const results: Record<string, any> = {};

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      results[table] = {
        exists: !error,
        error: error?.message || null,
        errorCode: error?.code || null,
        hasData: !!data && data.length > 0,
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Error testing builder tables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
