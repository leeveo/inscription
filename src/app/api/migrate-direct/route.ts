import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST() {
  try {
    console.log('🔧 Starting database migration for page_type column...');

    // Execute the SQL directly using admin client
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE builder_pages
        ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'landing_page'
        CHECK (page_type IN ('landing_page', 'registration_form'));

        UPDATE builder_pages
        SET page_type = 'landing_page'
        WHERE page_type IS NULL;

        CREATE INDEX IF NOT EXISTS idx_builder_pages_page_type ON builder_pages(page_type);
      `
    });

    if (error) {
      console.error('SQL execution failed, trying alternative approach...');

      // Alternative: Try to just select first to see if column exists
      const { error: testError } = await supabaseAdmin
        .from('builder_pages')
        .select('page_type')
        .limit(1);

      if (testError && testError.message.includes('column "page_type" does not exist')) {
        console.error('Column page_type does not exist. Manual migration required.');
        return NextResponse.json({
          success: false,
          error: 'Column page_type does not exist',
          sql: `
            ALTER TABLE builder_pages
            ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'landing_page'
            CHECK (page_type IN ('landing_page', 'registration_form'));

            UPDATE builder_pages
            SET page_type = 'landing_page'
            WHERE page_type IS NULL;

            CREATE INDEX IF NOT EXISTS idx_builder_pages_page_type ON builder_pages(page_type);
          `
        }, { status: 400 });
      } else if (testError) {
        console.error('Other database error:', testError);
        return NextResponse.json({
          success: false,
          error: 'Database error',
          details: testError.message
        }, { status: 500 });
      } else {
        console.log('✅ Column page_type already exists');
        return NextResponse.json({
          success: true,
          message: 'Column page_type already exists'
        });
      }
    }

    console.log('✅ Migration completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      data
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}