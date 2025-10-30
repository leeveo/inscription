// Script pour vérifier la structure de la table sessions et diagnostiquer les problèmes
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './event-admin/.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.error('Vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkSessionsTable() {
  console.log('🔍 Diagnostic de la table inscription_sessions\n')

  try {
    // 1. Vérifier l'existence de la table
    console.log('1️⃣ Vérification de l\'existence de la table...')
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'inscription_sessions')

    if (tableError || !tables || tables.length === 0) {
      console.error('❌ La table inscription_sessions n\'existe pas!')
      console.log('\n📋 Pour créer la table, exécutez ce SQL dans Supabase:')
      console.log(`
CREATE TABLE public.inscription_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evenement_id UUID REFERENCES public.inscription_evenements(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  intervenant TEXT,
  intervenant_id INTEGER REFERENCES public.inscription_intervenants(id) ON DELETE SET NULL,
  programme TEXT,
  lieu TEXT,
  type TEXT NOT NULL,
  max_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
      `)
      return
    }

    console.log('✅ Table inscription_sessions existe')

    // 2. Vérifier la structure des colonnes
    console.log('\n2️⃣ Vérification de la structure des colonnes...')
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'inscription_sessions')
      .order('ordinal_position')

    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError.message)
      return
    }

    const expectedColumns = [
      'id', 'evenement_id', 'titre', 'description', 'date', 
      'heure_debut', 'heure_fin', 'intervenant', 'intervenant_id', 
      'programme', 'lieu', 'type', 'max_participants', 'created_at'
    ]

    const existingColumns = columns.map(col => col.column_name)
    const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col))

    if (missingColumns.length > 0) {
      console.error('❌ Colonnes manquantes:', missingColumns.join(', '))
      console.log('\n📋 Pour ajouter les colonnes manquantes:')
      missingColumns.forEach(col => {
        if (col === 'intervenant_id') {
          console.log(`ALTER TABLE inscription_sessions ADD COLUMN ${col} INTEGER REFERENCES inscription_intervenants(id) ON DELETE SET NULL;`)
        } else if (col === 'programme') {
          console.log(`ALTER TABLE inscription_sessions ADD COLUMN ${col} TEXT;`)
        } else if (col === 'max_participants') {
          console.log(`ALTER TABLE inscription_sessions ADD COLUMN ${col} INTEGER;`)
        }
      })
    } else {
      console.log('✅ Toutes les colonnes requises sont présentes')
    }

    console.log('\n📊 Structure actuelle:')
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`)
    })

    // 3. Tester une opération de lecture
    console.log('\n3️⃣ Test de lecture des sessions...')
    const { data: sessionsData, error: readError } = await supabase
      .from('inscription_sessions')
      .select('*')
      .limit(5)

    if (readError) {
      console.error('❌ Erreur de lecture:', readError.message)
    } else {
      console.log(`✅ Lecture réussie: ${sessionsData.length} session(s) trouvée(s)`)
    }

    // 4. Tester une opération d'écriture factice
    console.log('\n4️⃣ Test d\'écriture (simulation)...')
    const testData = {
      evenement_id: '533c4f88-f3ed-47b9-8e99-630e5e6bf5b4',
      titre: 'Session de test',
      description: 'Test de la fonction de mise à jour',
      date: '2024-12-31',
      heure_debut: '10:00',
      heure_fin: '11:00',
      type: 'test',
      lieu: 'Test location'
    }

    // Simuler l'insertion sans vraiment insérer
    console.log('📝 Données d\'exemple qui seraient insérées:')
    console.log(JSON.stringify(testData, null, 2))

    // 5. Vérifier les permissions RLS
    console.log('\n5️⃣ Vérification des politiques RLS...')
    const { data: rlsPolicies, error: rlsError } = await supabase
      .from('pg_policies')
      .select('policyname, permissive, roles, cmd, qual')
      .eq('tablename', 'inscription_sessions')

    if (rlsError) {
      console.log('⚠️ Impossible de vérifier RLS (permissions insuffisantes)')
    } else if (rlsPolicies && rlsPolicies.length > 0) {
      console.log('📋 Politiques RLS actives:')
      rlsPolicies.forEach(policy => {
        console.log(`  - ${policy.policyname} (${policy.cmd})`)
      })
    } else {
      console.log('✅ Aucune politique RLS restrictive trouvée')
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter le diagnostic
checkSessionsTable().then(() => {
  console.log('\n🎯 Diagnostic terminé!')
  console.log('\n🚀 Pour tester la mise à jour:')
  console.log('  1. Vérifiez que toutes les colonnes sont présentes')
  console.log('  2. Allez sur http://localhost:3001/admin/evenements/533c4f88-f3ed-47b9-8e99-630e5e6bf5b4/edit')
  console.log('  3. Cliquez sur l\'onglet Sessions')
  console.log('  4. Modifiez une session et sauvegardez')
  console.log('  5. Surveillez les logs dans la console développeur')
  process.exit(0)
}).catch(error => {
  console.error('💥 Échec du diagnostic:', error)
  process.exit(1)
})