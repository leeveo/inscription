/**
 * Script de diagnostic pour identifier les problèmes du système de domaines
 * Usage: node diagnostic-domain-system.js
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnosticDomainSystem() {
  console.log('🔍 === DIAGNOSTIC DU SYSTÈME DE DOMAINES ===\n')
  
  try {
    // 1. Vérifier les événements
    console.log('1️⃣ ÉVÉNEMENTS:')
    const { data: events, error: eventsError } = await supabase
      .from('inscription_evenements')
      .select('id, nom, builder_page_id')
      .limit(10)
    
    if (eventsError) {
      console.error('❌ Erreur événements:', eventsError)
    } else {
      console.log(`✅ ${events.length} événements trouvés`)
      events.forEach(event => {
        console.log(`   - ${event.nom} (ID: ${event.id.slice(0,8)}..., Page: ${event.builder_page_id || 'AUCUNE'})`)
      })
    }

    // 2. Vérifier les sites builder
    console.log('\n2️⃣ SITES BUILDER:')
    const { data: sites, error: sitesError } = await supabase
      .from('builder_sites')
      .select('id, name, event_id')
      .limit(10)
    
    if (sitesError) {
      console.error('❌ Erreur sites:', sitesError)
    } else {
      console.log(`✅ ${sites.length} sites trouvés`)
      sites.forEach(site => {
        console.log(`   - ${site.name} (ID: ${site.id.slice(0,8)}..., Event: ${site.event_id?.slice(0,8) || 'AUCUN'}...)`)
      })
    }

    // 3. Vérifier les pages builder
    console.log('\n3️⃣ PAGES BUILDER:')
    const { data: pages, error: pagesError } = await supabase
      .from('builder_pages')
      .select('id, name, slug, status, site_id')
      .limit(10)
    
    if (pagesError) {
      console.error('❌ Erreur pages:', pagesError)
    } else {
      console.log(`✅ ${pages.length} pages trouvées`)
      pages.forEach(page => {
        console.log(`   - ${page.name} (Slug: ${page.slug}, Status: ${page.status}, Site: ${page.site_id?.slice(0,8) || 'AUCUN'}...)`)
      })
    }

    // 4. Vérifier les domaines
    console.log('\n4️⃣ DOMAINES:')
    const { data: domains, error: domainsError } = await supabase
      .from('builder_domains')
      .select('id, host, type, dns_status, ssl_status, site_id')
      .limit(10)
    
    if (domainsError) {
      console.error('❌ Erreur domaines:', domainsError)
    } else {
      console.log(`✅ ${domains.length} domaines trouvés`)
      domains.forEach(domain => {
        console.log(`   - ${domain.host} (${domain.type}, DNS: ${domain.dns_status}, SSL: ${domain.ssl_status}, Site: ${domain.site_id?.slice(0,8)}...)`)
      })
    }

    // 5. Analyse des liaisons manquantes
    console.log('\n5️⃣ ANALYSE DES LIAISONS:')
    
    // Événements sans site
    const eventsWithoutSites = events.filter(event => 
      !sites.some(site => site.event_id === event.id)
    )
    console.log(`⚠️  ${eventsWithoutSites.length} événement(s) sans site builder`)
    
    // Sites sans pages
    const sitesWithoutPages = sites.filter(site =>
      !pages.some(page => page.site_id === site.id)
    )
    console.log(`⚠️  ${sitesWithoutPages.length} site(s) sans pages`)
    
    // Sites sans domaines
    const sitesWithoutDomains = sites.filter(site =>
      !domains.some(domain => domain.site_id === site.id)
    )
    console.log(`⚠️  ${sitesWithoutDomains.length} site(s) sans domaine`)
    
    // Pages non publiées
    const unpublishedPages = pages.filter(page => page.status !== 'published')
    console.log(`⚠️  ${unpublishedPages.length} page(s) non publiée(s)`)

    // 6. Test du flux complet pour un événement spécifique
    console.log('\n6️⃣ TEST ÉVÉNEMENT SPÉCIFIQUE:')
    const targetEventId = '533c4f88-f3ed-47b9-8e99-630e5e6bf5b4'
    
    const targetEvent = events.find(e => e.id === targetEventId)
    if (targetEvent) {
      console.log(`🎯 Événement: ${targetEvent.nom}`)
      
      const linkedSite = sites.find(s => s.event_id === targetEventId)
      console.log(`   Site lié: ${linkedSite ? linkedSite.name : '❌ AUCUN'}`)
      
      if (linkedSite) {
        const linkedPages = pages.filter(p => p.site_id === linkedSite.id)
        console.log(`   Pages: ${linkedPages.length} (${linkedPages.filter(p => p.status === 'published').length} publiées)`)
        
        const linkedDomains = domains.filter(d => d.site_id === linkedSite.id)
        console.log(`   Domaines: ${linkedDomains.length}`)
        linkedDomains.forEach(d => {
          console.log(`     - ${d.host} (${d.dns_status}/${d.ssl_status})`)
        })
      }
    } else {
      console.log(`❌ Événement ${targetEventId} non trouvé`)
    }

    console.log('\n✅ === DIAGNOSTIC TERMINÉ ===')

  } catch (error) {
    console.error('❌ Erreur critique:', error)
  }
}

// Exécuter le diagnostic
diagnosticDomainSystem()