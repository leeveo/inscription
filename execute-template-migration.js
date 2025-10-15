const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function executeTemplateMigration() {
    try {
        // Configuration Supabase (utiliser la même config que les autres scripts)
        const supabaseUrl = 'https://giafkganhfuxvadeiars.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYWZrZ2FuaGZ1eHZhZGVpYXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNzMyMjUsImV4cCI6MjA0NDc0OTIyNX0.pS7TxrbTiJK1MhiIFJBELx_u9abS3yub1AcDu3Ex1Y8';
        
        console.log('📝 Note: Utilisation de la clé anon pour la migration (RLS devrait permettre les opérations)');

        console.log('🔗 Connexion à Supabase...');
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Lire le fichier SQL
        console.log('📄 Lecture du script de migration...');
        const sql = fs.readFileSync('./migrations/cleanup_template_duplicates.sql', 'utf8');
        
        console.log('📊 Script contient:', sql.length, 'caractères');

        // Vérifier l'état actuel
        console.log('🔍 Vérification de l\'état actuel des templates...');
        const { data: existingTemplates, error: checkError } = await supabase
            .from('email_templates')
            .select('name, template_type');

        if (checkError) {
            console.error('❌ Erreur lors de la vérification:', checkError.message);
        } else {
            console.log('📋 Templates existants:', existingTemplates?.length || 0);
            existingTemplates?.forEach(t => console.log(`  - ${t.name} (${t.template_type})`));
        }

        // Diviser et exécuter le script par sections
        console.log('🚀 Exécution de la migration...');
        
        // Extraction et exécution des sections individuelles
        const sections = sql.split(';').filter(section => section.trim());
        
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i].trim();
            if (!section) continue;

            console.log(`⚙️  Exécution de la section ${i + 1}/${sections.length}...`);
            
            const { error } = await supabase.rpc('execute_sql', {
                sql_query: section + ';'
            });

            if (error) {
                console.error(`❌ Erreur section ${i + 1}:`, error.message);
                // Continue avec les autres sections
            } else {
                console.log(`✅ Section ${i + 1} exécutée avec succès`);
            }
        }

        // Vérifier le résultat final
        console.log('🔍 Vérification finale...');
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

executeTemplateMigration();