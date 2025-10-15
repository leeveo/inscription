import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseApi();
    const { searchParams } = new URL(request.url);
    const evenement_id = searchParams.get('evenement_id');

    if (!evenement_id) {
      return NextResponse.json(
        { success: false, error: 'L\'ID de l\'événement est requis' },
        { status: 400 }
      );
    }

    // Récupérer les types de billets avec leurs informations de quota
    const { data: ticketTypes, error: ticketTypesError } = await supabase
      .from('inscription_ticket_types')
      .select(`
        *,
        order_items:inscription_order_items(
          quantite,
          created_at,
          order:inscription_orders(
            statut,
            created_at
          )
        )
      `)
      .eq('evenement_id', evenement_id)
      .eq('visible', true)
      .order('created_at', { ascending: true });

    if (ticketTypesError) {
      console.error('Erreur lors de la récupération des types de billets:', ticketTypesError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des types de billets' },
        { status: 500 }
      );
    }

    // Préparer les données de quota
    const quotaData = [];

    for (const ticketType of ticketTypes || []) {
      // Calculer les ventes totales (uniquement les commandes payées)
      let billetsVendus = 0;
      let ventesRecentes = 0; // Dernière heure
      let visitesRecentes = 0; // Visites des landing pages (simulation)

      if (ticketType.order_items && ticketType.order_items.length > 0) {
        const maintenant = new Date();
        const ilYUneHeure = new Date(maintenant.getTime() - 60 * 60 * 1000);

        for (const item of ticketType.order_items) {
          // Compter uniquement les commandes payées
          if (item.order && item.order.statut === 'paid') {
            billetsVendus += item.quantite;

            // Ventes récentes (dernière heure)
            if (new Date(item.order.created_at) > ilYUneHeure) {
              ventesRecentes += item.quantite;
            }
          }
        }

        // Simuler les visites (en pratique, viendrait de la table landing_page_visits)
        visitesRecentes = Math.max(ventesRecentes * 3, 10); // Estimation grossière
      }

      // Calculer le quota disponible
      const quotaTotal = ticketType.quota_total;
      const quotaDisponible = quotaTotal !== null ? Math.max(0, quotaTotal - billetsVendus) : null;

      // Calculer le pourcentage vendu
      const pourcentageVendu = quotaTotal !== null ? (billetsVendus / quotaTotal) * 100 : 0;

      // Déterminer le statut
      let statut = 'disponible';
      if (quotaTotal === null) {
        statut = 'illimite';
      } else if (quotaDisponible === 0) {
        statut = 'epuise';
      } else if (quotaDisponible <= quotaTotal * 0.1) {
        statut = 'bientot_epuise';
      }

      // Estimer l'épuisement basé sur le taux de vente récent
      let estimationEpuisement = null;
      if (ventesRecentes > 0 && quotaDisponible !== null && quotaDisponible > 0) {
        const heuresRestantes = quotaDisponible / ventesRecentes;
        const dateEpuisement = new Date(Date.now() + heuresRestantes * 60 * 60 * 1000);
        estimationEpuisement = dateEpuisement.toISOString();
      }

      // Calculer le taux de conversion récent
      const tauxConversionRecent = visitesRecentes > 0 ? (ventesRecentes / visitesRecentes) * 100 : 0;

      quotaData.push({
        ticket_type_id: ticketType.id,
        ticket_nom: ticketType.nom,
        quota_total: quotaTotal,
        billets_vendus: billetsVendus,
        quota_disponible: quotaDisponible,
        pourcentage_vendu: pourcentageVendu,
        statut,
        ventes_recentes: ventesRecentes,
        taux_conversion_recent: tauxConversionRecent,
        estimation_epuisement: estimationEpuisement,
        dernier_ajout: ticketType.order_items && ticketType.order_items.length > 0
          ? Math.max(...ticketType.order_items.map(item => new Date(item.created_at).getTime()))
          : null,
        prix_moyen: ticketType.prix,
        type_tarif: ticketType.type_tarif,
        visible: ticketType.visible,
        vente_en_ligne: ticketType.vente_en_ligne
      });
    }

    // Trier par priorité (billets bientôt épuisés en premier)
    quotaData.sort((a, b) => {
      const prioriteA = a.statut === 'epuise' ? 0 : a.statut === 'bientot_epuise' ? 1 : 2;
      const prioriteB = b.statut === 'epuise' ? 0 : b.statut === 'bientot_epuise' ? 1 : 2;
      return prioriteA - prioriteB;
    });

    // Statistiques globales pour l'événement
    const stats = {
      total_types: quotaData.length,
      types_epuises: quotaData.filter(q => q.statut === 'epuise').length,
      types_bientot_epuises: quotaData.filter(q => q.statut === 'bientot_epuise').length,
      total_billets_vendus: quotaData.reduce((sum, q) => sum + q.billets_vendus, 0),
      total_ventes_recentes: quotaData.reduce((sum, q) => sum + q.ventes_recentes, 0),
      taux_conversion_global: quotaData.length > 0
        ? quotaData.reduce((sum, q) => sum + q.taux_conversion_recent, 0) / quotaData.length
        : 0
    };

    return NextResponse.json({
      success: true,
      data: quotaData,
      stats,
      last_update: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors du chargement du statut des quotas:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}