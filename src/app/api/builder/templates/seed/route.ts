import { NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import conferenceTemplate from '@/data/templates/conference-1day.json';
import webinarTemplate from '@/data/templates/webinar.json';

export async function GET() {
  const supabase = supabaseApi();

  try {
    // Insert Conference template
    const { error: conferenceError } = await supabase
      .from('builder_templates')
      .upsert({
        id: 'e7d3c2a1-b4f5-4e6d-9c8b-1a2b3c4d5e6f',
        key: 'template-conference-1day',
        label: 'Conférence 1 Jour',
        description: 'Template complet pour une conférence d\'une journée avec agenda, speakers et inscription',
        category: 'event',
        preview_image: '/templates/conference-1day-preview.png',
        schema: conferenceTemplate.tree,
        is_public: true,
        version: '1.0.0',
        tags: ['conference', 'event', 'in-person', 'agenda', 'speakers']
      }, { onConflict: 'key' });

    if (conferenceError) throw conferenceError;

    // Insert Webinar template
    const { error: webinarError } = await supabase
      .from('builder_templates')
      .upsert({
        id: 'f8e4d3b2-c5f6-5f7e-0d9c-2b3c4d5e6f7a',
        key: 'template-webinar',
        label: 'Webinar',
        description: 'Template optimisé pour webinaires en ligne avec focus sur l\'inscription et les informations pratiques',
        category: 'online',
        preview_image: '/templates/webinar-preview.png',
        schema: webinarTemplate.tree,
        is_public: true,
        version: '1.0.0',
        tags: ['webinar', 'online', 'formation', 'virtual']
      }, { onConflict: 'key' });

    if (webinarError) throw webinarError;

    return NextResponse.json({
      success: true,
      message: 'Templates seeded successfully',
      templates: ['template-conference-1day', 'template-webinar']
    });

  } catch (error) {
    console.error('Error seeding templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : JSON.stringify(error),
        details: error
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
