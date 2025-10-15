const { createClient } = require('@supabase/supabase-js');

async function addNewTemplates() {
    try {
        // Configuration Supabase
        const supabaseUrl = 'https://giafkganhfuxvadeiars.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYWZrZ2FuaGZ1eHZhZGVpYXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNzMyMjUsImV4cCI6MjA0NDc0OTIyNX0.pS7TxrbTiJK1MhiIFJBELx_u9abS3yub1AcDu3Ex1Y8';
        
        console.log('🔗 Connexion à Supabase...');
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Vérifier l'état actuel
        console.log('🔍 Vérification des templates existants...');
        const { data: existingTemplates, error: checkError } = await supabase
            .from('email_templates')
            .select('name, template_type');

        if (checkError) {
            console.error('❌ Erreur lors de la vérification:', checkError.message);
            return;
        }

        console.log('📋 Templates existants:', existingTemplates?.length || 0);
        existingTemplates?.forEach(t => console.log(`  - ${t.name} (${t.template_type})`));

        // Définir les nouveaux templates à ajouter
        const newTemplates = [
            {
                name: 'Template Corporate',
                template_type: 'corporate',
                html_content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { 
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; 
            line-height: 1.5; 
            color: #2c3e50; 
            margin: 0; 
            padding: 0;
            background-color: #f8f9fa;
        }
        .container { 
            max-width: 650px; 
            margin: 30px auto; 
            background: white;
            box-shadow: 0 4px 25px rgba(0,0,0,0.08);
        }
        .header { 
            background: linear-gradient(135deg, {{header_color}} 0%, rgba(0,0,0,0.1) 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: left;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 26px;
            font-weight: 300;
            letter-spacing: 0.5px;
        }
        .content { 
            padding: 40px 30px; 
            background: white;
        }
        .section { 
            margin: 30px 0;
            padding: 25px;
            background: #fafbfc;
            border-left: 3px solid {{header_color}};
        }
        .session-item { 
            background: white; 
            padding: 20px; 
            margin: 15px 0; 
            border: 1px solid #dee2e6;
            border-radius: 4px;
            border-left: 4px solid {{header_color}};
        }
        .footer { 
            background: #2c3e50;
            color: white;
            text-align: center; 
            padding: 30px; 
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Inscription validée</h1>
            <p>{{participant_firstname}} {{participant_lastname}}</p>
        </div>
        <div class="content">
            <p>Nous vous confirmons votre inscription à <strong>{{event_name}}</strong>.</p>
            <div class="section">
                <h2>Détails de l'événement</h2>
                <p><strong>Date:</strong> {{event_date}}</p>
                <p><strong>Lieu:</strong> {{event_location}}</p>
                {{#if event_price}}<p><strong>Prix:</strong> {{event_price}}€</p>{{/if}}
            </div>
            {{sessions_html}}
        </div>
        <div class="footer">
            <p>Contact : {{contact_email}}</p>
        </div>
    </div>
</body>
</html>`,
                variables: '{"header_color": "Couleur du header", "event_name": "Nom de l\'événement", "event_date": "Date", "event_location": "Lieu", "event_price": "Prix", "participant_firstname": "Prénom", "participant_lastname": "Nom", "contact_email": "Email de contact", "sessions_html": "HTML des sessions"}',
                is_default: false
            },
            {
                name: 'Template Newsletter',
                template_type: 'newsletter',
                html_content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { 
            font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            margin: 0; 
            padding: 20px 0;
            background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header { 
            background: {{header_color}}; 
            color: white; 
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: 700;
        }
        .content { 
            padding: 32px 24px; 
        }
        .card {
            background: #f9fafb;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
        }
        .session-item { 
            background: white; 
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px; 
            margin: 16px 0; 
            border-left: 4px solid {{header_color}};
        }
        .footer { 
            background: #f9fafb;
            text-align: center; 
            padding: 24px; 
            color: #6b7280; 
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Inscription confirmée !</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>{{participant_firstname}}</strong> ! 👋</p>
            <div class="card">
                <h3>{{event_name}}</h3>
                <p><strong>Date:</strong> {{event_date}}</p>
                <p><strong>Lieu:</strong> {{event_location}}</p>
                {{#if event_price}}<p><strong>Prix:</strong> {{event_price}}€</p>{{/if}}
            </div>
            {{sessions_html}}
        </div>
        <div class="footer">
            <p>Contact : {{contact_email}}</p>
        </div>
    </div>
</body>
</html>`,
                variables: '{"header_color": "Couleur du header", "event_name": "Nom de l\'événement", "event_date": "Date", "event_location": "Lieu", "event_price": "Prix", "participant_firstname": "Prénom", "participant_lastname": "Nom", "contact_email": "Email de contact", "sessions_html": "HTML des sessions"}',
                is_default: false
            },
            {
                name: 'Template Carte',
                template_type: 'card',
                html_content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { 
            font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.5; 
            color: #1d1d1f; 
            margin: 0; 
            padding: 40px 20px;
            background: #f5f5f7;
        }
        .container { 
            max-width: 580px; 
            margin: 0 auto; 
        }
        .ticket {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .ticket-header { 
            background: linear-gradient(135deg, {{header_color}} 0%, #000 100%);
            color: white; 
            padding: 32px 28px;
            text-align: center;
        }
        .ticket-header h1 {
            margin: 0 0 8px 0;
            font-size: 22px;
            font-weight: 700;
        }
        .ticket-body { 
            padding: 28px; 
        }
        .participant-info {
            text-align: center;
            margin-bottom: 32px;
        }
        .participant-name {
            font-size: 24px;
            font-weight: 700;
            color: #1d1d1f;
        }
        .event-details {
            background: #fafafa;
            border-radius: 16px;
            padding: 24px;
            margin: 24px 0;
        }
        .session-item { 
            background: white;
            border: 1px solid #f0f0f0;
            border-radius: 12px;
            padding: 20px; 
            margin: 16px 0; 
            border-left: 4px solid {{header_color}};
        }
        .footer-card {
            background: #1d1d1f;
            color: white;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="ticket">
            <div class="ticket-header">
                <h1>🎫 Billet d'entrée</h1>
            </div>
            <div class="ticket-body">
                <div class="participant-info">
                    <div class="participant-name">{{participant_firstname}} {{participant_lastname}}</div>
                </div>
                <div class="event-details">
                    <p><strong>Événement:</strong> {{event_name}}</p>
                    <p><strong>Date:</strong> {{event_date}}</p>
                    <p><strong>Lieu:</strong> {{event_location}}</p>
                    {{#if event_price}}<p><strong>Prix:</strong> {{event_price}}€</p>{{/if}}
                </div>
                {{sessions_html}}
            </div>
        </div>
        <div class="footer-card">
            <p>Contact : {{contact_email}}</p>
        </div>
    </div>
</body>
</html>`,
                variables: '{"header_color": "Couleur du header", "event_name": "Nom de l\'événement", "event_date": "Date", "event_location": "Lieu", "event_price": "Prix", "participant_firstname": "Prénom", "participant_lastname": "Nom", "contact_email": "Email de contact", "sessions_html": "HTML des sessions"}',
                is_default: false
            },
            {
                name: 'Template Notification',
                template_type: 'notification',
                html_content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { 
            font-family: "Roboto", -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.6; 
            color: #212529; 
            margin: 0; 
            padding: 0;
            background: #f8f9fa;
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
        }
        .notification-banner {
            background: {{header_color}};
            color: white;
            padding: 16px 20px;
            border-radius: 8px 8px 0 0;
            display: flex;
            align-items: center;
        }
        .main-content {
            background: white;
            padding: 24px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .content-header h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 700;
            color: #212529;
        }
        .info-box {
            background: #f8f9fa;
            border-left: 4px solid {{header_color}};
            padding: 20px;
            margin: 20px 0;
        }
        .session-item { 
            background: #ffffff;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 18px; 
            margin: 12px 0; 
            border-left: 4px solid {{header_color}};
        }
        .footer { 
            text-align: center; 
            padding: 20px; 
            color: #6c757d; 
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="notification-banner">
            <div>✓ Inscription confirmée avec succès</div>
        </div>
        <div class="main-content">
            <div class="content-header">
                <h1>C'est confirmé !</h1>
                <p>Bonjour {{participant_firstname}}, votre place est réservée.</p>
            </div>
            <div class="info-box">
                <h3>Détails de l'événement</h3>
                <p><strong>Événement:</strong> {{event_name}}</p>
                <p><strong>Date:</strong> {{event_date}}</p>
                <p><strong>Lieu:</strong> {{event_location}}</p>
                {{#if event_price}}<p><strong>Prix:</strong> {{event_price}}€</p>{{/if}}
            </div>
            {{sessions_html}}
        </div>
        <div class="footer">
            <p>Contact : {{contact_email}}</p>
        </div>
    </div>
</body>
</html>`,
                variables: '{"header_color": "Couleur du header", "event_name": "Nom de l\'événement", "event_date": "Date", "event_location": "Lieu", "event_price": "Prix", "participant_firstname": "Prénom", "participant_lastname": "Nom", "contact_email": "Email de contact", "sessions_html": "HTML des sessions"}',
                is_default: false
            }
        ];

        // Ajouter chaque template
        console.log('➕ Ajout des nouveaux templates...');
        
        for (let i = 0; i < newTemplates.length; i++) {
            const template = newTemplates[i];
            console.log(`  📝 Ajout du template "${template.name}" (${template.template_type})...`);
            
            const { error } = await supabase
                .from('email_templates')
                .insert([template]);

            if (error) {
                console.error(`  ❌ Erreur pour "${template.name}":`, error.message);
            } else {
                console.log(`  ✅ Template "${template.name}" ajouté avec succès`);
            }
        }

        // Vérifier le résultat final
        console.log('\n🔍 Vérification finale...');
        const { data: finalTemplates, error: finalError } = await supabase
            .from('email_templates')
            .select('name, template_type, is_default')
            .order('is_default', { ascending: false });

        if (finalError) {
            console.error('❌ Erreur lors de la vérification finale:', finalError.message);
        } else {
            console.log('🎉 Migration terminée !');
            console.log('📊 Templates finaux:', finalTemplates?.length || 0);
            finalTemplates?.forEach(t => {
                const status = t.is_default ? ' (PAR DÉFAUT)' : '';
                console.log(`  - ${t.name} (${t.template_type})${status}`);
            });
        }

    } catch (error) {
        console.error('💥 Erreur générale:', error.message);
        process.exit(1);
    }
}

addNewTemplates();