-- ============================================
-- Insert Starter Templates (CORRECTED)
-- ============================================
-- This script inserts the two starter templates into builder_templates table
-- Templates: Conference 1-Day, Webinar

-- Conference 1-Day Template
INSERT INTO builder_templates (
  id,
  key,
  label,
  description,
  category,
  preview_image,
  schema,
  is_public
) VALUES (
  'e7d3c2a1-b4f5-4e6d-9c8b-1a2b3c4d5e6f',
  'template-conference-1day',
  'Conférence 1 Jour',
  'Template complet pour une conférence d''une journée avec agenda, speakers et inscription',
  'event',
  '/templates/conference-1day-preview.png',
  '{
    "ROOT": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "min-h-screen"
      },
      "displayName": "Container",
      "custom": {},
      "hidden": false,
      "nodes": ["hero-section", "countdown-section", "agenda-section", "speakers-section", "map-section", "faq-section", "footer-section"],
      "linkedNodes": {}
    },
    "hero-section": {
      "type": {
        "resolvedName": "Hero"
      },
      "isCanvas": false,
      "props": {
        "title": "Conférence Annuelle 2025",
        "subtitle": "Rejoignez-nous pour une journée d''apprentissage et de networking",
        "backgroundImage": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80",
        "ctaText": "Réserver ma place",
        "ctaLink": "#inscription",
        "alignment": "center",
        "height": "large",
        "overlay": true,
        "overlayOpacity": 60
      },
      "displayName": "Hero",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "countdown-section": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "bg-gradient-to-r from-blue-600 to-purple-600 py-12"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": ["countdown"],
      "linkedNodes": {}
    },
    "countdown": {
      "type": {
        "resolvedName": "Countdown"
      },
      "isCanvas": false,
      "props": {
        "title": "Commence dans",
        "targetDate": "2025-06-15T09:00:00",
        "showDays": true,
        "showHours": true,
        "showMinutes": true,
        "showSeconds": true,
        "textColor": "#FFFFFF",
        "numberColor": "#FFFFFF",
        "backgroundColor": "transparent"
      },
      "displayName": "Countdown",
      "custom": {},
      "parent": "countdown-section",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "agenda-section": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "py-16 px-4 bg-gray-50"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": ["agenda"],
      "linkedNodes": {}
    },
    "agenda": {
      "type": {
        "resolvedName": "Agenda"
      },
      "isCanvas": false,
      "props": {
        "title": "Programme de la journée",
        "groupBy": "none",
        "showSpeakers": true,
        "allowEnrollment": false
      },
      "displayName": "Agenda",
      "custom": {},
      "parent": "agenda-section",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {},
      "dataBinding": {
        "table": "inscription_sessions",
        "select": ["*"],
        "where": [],
        "orderBy": [
          {
            "column": "heure_debut",
            "ascending": true
          }
        ],
        "runtime": "build"
      }
    },
    "speakers-section": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "py-16 px-4 bg-white"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": ["speakers"],
      "linkedNodes": {}
    },
    "speakers": {
      "type": {
        "resolvedName": "Speakers"
      },
      "isCanvas": false,
      "props": {
        "title": "Nos Intervenants",
        "layout": "grid",
        "columns": 3,
        "showBio": true,
        "showSocial": true
      },
      "displayName": "Speakers",
      "custom": {},
      "parent": "speakers-section",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "map-section": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "py-16 px-4 bg-gray-50"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": ["map"],
      "linkedNodes": {}
    },
    "map": {
      "type": {
        "resolvedName": "Map"
      },
      "isCanvas": false,
      "props": {
        "title": "Lieu de l''événement",
        "address": "Centre de Congrès, 123 Avenue Principale, Paris, France",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "zoom": 15,
        "height": 400,
        "showDirections": true
      },
      "displayName": "Map",
      "custom": {},
      "parent": "map-section",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "faq-section": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "py-16 px-4 bg-white"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": ["faq"],
      "linkedNodes": {}
    },
    "faq": {
      "type": {
        "resolvedName": "FAQ"
      },
      "isCanvas": false,
      "props": {
        "title": "Questions Fréquentes",
        "items": [
          {
            "question": "À quelle heure commence la conférence ?",
            "answer": "La conférence commence à 9h00. Nous vous recommandons d''arriver 30 minutes à l''avance pour l''enregistrement."
          },
          {
            "question": "Le déjeuner est-il inclus ?",
            "answer": "Oui, le déjeuner et les pauses café sont inclus dans votre inscription."
          },
          {
            "question": "Y a-t-il un parking disponible ?",
            "answer": "Oui, un parking gratuit est disponible pour tous les participants sur présentation de votre badge."
          },
          {
            "question": "Puis-je obtenir un remboursement ?",
            "answer": "Les annulations sont acceptées jusqu''à 7 jours avant l''événement avec un remboursement complet."
          }
        ],
        "accordion": true
      },
      "displayName": "FAQ",
      "custom": {},
      "parent": "faq-section",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "footer-section": {
      "type": {
        "resolvedName": "Footer"
      },
      "isCanvas": false,
      "props": {
        "companyName": "EventPro",
        "logo": "",
        "description": "Votre partenaire pour des événements réussis",
        "links": [
          {
            "title": "Navigation",
            "items": [
              { "label": "Accueil", "url": "#" },
              { "label": "Programme", "url": "#agenda" },
              { "label": "Intervenants", "url": "#speakers" },
              { "label": "Contact", "url": "#contact" }
            ]
          },
          {
            "title": "Légal",
            "items": [
              { "label": "Mentions légales", "url": "/legal" },
              { "label": "Politique de confidentialité", "url": "/privacy" },
              { "label": "CGV", "url": "/terms" }
            ]
          }
        ],
        "socialLinks": [
          { "platform": "LinkedIn", "url": "https://linkedin.com" },
          { "platform": "Twitter", "url": "https://twitter.com" },
          { "platform": "Facebook", "url": "https://facebook.com" }
        ],
        "copyright": "© 2025 EventPro. Tous droits réservés."
      },
      "displayName": "Footer",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    }
  }',
  true
) ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  schema = EXCLUDED.schema,
  updated_at = NOW();

-- Webinar Template
INSERT INTO builder_templates (
  id,
  key,
  label,
  description,
  category,
  preview_image,
  schema,
  is_public
) VALUES (
  'f8e4d3b2-c5g6-5f7e-0d9c-2b3c4d5e6f7g',
  'template-webinar',
  'Webinar',
  'Template optimisé pour webinaires en ligne avec focus sur l''inscription et les informations pratiques',
  'online',
  '/templates/webinar-preview.png',
  '{
    "ROOT": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50"
      },
      "displayName": "Container",
      "custom": {},
      "hidden": false,
      "nodes": ["hero-section", "countdown-section", "benefits-section", "speakers-section", "faq-section", "cta-section", "footer-section"],
      "linkedNodes": {}
    },
    "hero-section": {
      "type": {
        "resolvedName": "Hero"
      },
      "isCanvas": false,
      "props": {
        "title": "Webinar: Maîtrisez les Nouvelles Technologies",
        "subtitle": "Rejoignez notre session en direct et apprenez des experts",
        "backgroundImage": "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1920&q=80",
        "ctaText": "S''inscrire gratuitement",
        "ctaLink": "#inscription",
        "alignment": "center",
        "height": "medium",
        "overlay": true,
        "overlayOpacity": 70
      },
      "displayName": "Hero",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "countdown-section": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "bg-white py-12 border-b-4 border-indigo-600"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": ["countdown"],
      "linkedNodes": {}
    },
    "countdown": {
      "type": {
        "resolvedName": "Countdown"
      },
      "isCanvas": false,
      "props": {
        "title": "Le webinar commence dans",
        "targetDate": "2025-06-20T14:00:00",
        "showDays": true,
        "showHours": true,
        "showMinutes": true,
        "showSeconds": true,
        "textColor": "#1F2937",
        "numberColor": "#4F46E5",
        "backgroundColor": "transparent"
      },
      "displayName": "Countdown",
      "custom": {},
      "parent": "countdown-section",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "benefits-section": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "py-16 px-4 max-w-6xl mx-auto"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": ["benefits-title", "benefits-grid"],
      "linkedNodes": {}
    },
    "benefits-title": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "text": "<h2 class=\"text-3xl font-bold text-center mb-12 text-gray-900\">Ce que vous allez apprendre</h2>",
        "fontSize": 32,
        "textAlign": "center",
        "color": "#111827"
      },
      "displayName": "Text",
      "custom": {},
      "parent": "benefits-section",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "benefits-grid": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "grid md:grid-cols-3 gap-8"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "benefits-section",
      "hidden": false,
      "nodes": ["benefit-1", "benefit-2", "benefit-3"],
      "linkedNodes": {}
    },
    "benefit-1": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "benefits-grid",
      "hidden": false,
      "nodes": ["benefit-1-icon", "benefit-1-text"],
      "linkedNodes": {}
    },
    "benefit-1-icon": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "text": "<div class=\"text-5xl mb-4\">🎯</div>",
        "fontSize": 48,
        "textAlign": "center"
      },
      "displayName": "Text",
      "custom": {},
      "parent": "benefit-1",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "benefit-1-text": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "text": "<h3 class=\"text-xl font-bold mb-2 text-gray-900\">Stratégies Concrètes</h3><p class=\"text-gray-600\">Des techniques éprouvées que vous pourrez appliquer immédiatement</p>",
        "fontSize": 16,
        "textAlign": "center",
        "color": "#4B5563"
      },
      "displayName": "Text",
      "custom": {},
      "parent": "benefit-1",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "benefit-2": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "benefits-grid",
      "hidden": false,
      "nodes": ["benefit-2-icon", "benefit-2-text"],
      "linkedNodes": {}
    },
    "benefit-2-icon": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "text": "<div class=\"text-5xl mb-4\">💡</div>",
        "fontSize": 48,
        "textAlign": "center"
      },
      "displayName": "Text",
      "custom": {},
      "parent": "benefit-2",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "benefit-2-text": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "text": "<h3 class=\"text-xl font-bold mb-2 text-gray-900\">Insights d''Experts</h3><p class=\"text-gray-600\">Apprenez directement de professionnels reconnus du secteur</p>",
        "fontSize": 16,
        "textAlign": "center",
        "color": "#4B5563"
      },
      "displayName": "Text",
      "custom": {},
      "parent": "benefit-2",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "benefit-3": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "benefits-grid",
      "hidden": false,
      "nodes": ["benefit-3-icon", "benefit-3-text"],
      "linkedNodes": {}
    },
    "benefit-3-icon": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "text": "<div class=\"text-5xl mb-4\">🤝</div>",
        "fontSize": 48,
        "textAlign": "center"
      },
      "displayName": "Text",
      "custom": {},
      "parent": "benefit-3",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "benefit-3-text": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "text": "<h3 class=\"text-xl font-bold mb-2 text-gray-900\">Session Q&A Interactive</h3><p class=\"text-gray-600\">Posez vos questions en direct et obtenez des réponses personnalisées</p>",
        "fontSize": 16,
        "textAlign": "center",
        "color": "#4B5563"
      },
      "displayName": "Text",
      "custom": {},
      "parent": "benefit-3",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "speakers-section": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "py-16 px-4 bg-gray-50"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": ["speakers"],
      "linkedNodes": {}
    },
    "speakers": {
      "type": {
        "resolvedName": "Speakers"
      },
      "isCanvas": false,
      "props": {
        "title": "Vos Formateurs",
        "layout": "grid",
        "columns": 2,
        "showBio": true,
        "showSocial": true
      },
      "displayName": "Speakers",
      "custom": {},
      "parent": "speakers-section",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "faq-section": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "py-16 px-4 max-w-4xl mx-auto"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": ["faq"],
      "linkedNodes": {}
    },
    "faq": {
      "type": {
        "resolvedName": "FAQ"
      },
      "isCanvas": false,
      "props": {
        "title": "Questions Fréquentes",
        "items": [
          {
            "question": "Le webinar est-il gratuit ?",
            "answer": "Oui, ce webinar est 100% gratuit. Aucun frais caché."
          },
          {
            "question": "Aurai-je accès au replay ?",
            "answer": "Oui, tous les inscrits recevront un lien vers le replay disponible pendant 30 jours."
          },
          {
            "question": "Quelle plateforme utilisez-vous ?",
            "answer": "Nous utilisons Zoom pour une expérience interactive de qualité. Le lien vous sera envoyé 24h avant le webinar."
          },
          {
            "question": "Puis-je poser des questions pendant le webinar ?",
            "answer": "Absolument ! Nous aurons une session Q&A dédiée de 30 minutes à la fin de la présentation."
          },
          {
            "question": "Recevrai-je un certificat de participation ?",
            "answer": "Oui, un certificat de participation numérique vous sera envoyé après le webinar."
          }
        ],
        "accordion": true
      },
      "displayName": "FAQ",
      "custom": {},
      "parent": "faq-section",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "cta-section": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": ["cta-content"],
      "linkedNodes": {}
    },
    "cta-content": {
      "type": {
        "resolvedName": "Container"
      },
      "isCanvas": true,
      "props": {
        "className": "max-w-3xl mx-auto text-center"
      },
      "displayName": "Container",
      "custom": {},
      "parent": "cta-section",
      "hidden": false,
      "nodes": ["cta-title", "cta-subtitle", "cta-button"],
      "linkedNodes": {}
    },
    "cta-title": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "text": "<h2 class=\"text-4xl font-bold text-white mb-4\">Prêt à transformer vos compétences ?</h2>",
        "fontSize": 36,
        "textAlign": "center",
        "color": "#FFFFFF"
      },
      "displayName": "Text",
      "custom": {},
      "parent": "cta-content",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "cta-subtitle": {
      "type": {
        "resolvedName": "Text"
      },
      "isCanvas": false,
      "props": {
        "text": "<p class=\"text-xl text-indigo-100 mb-8\">Rejoignez des centaines de professionnels qui ont déjà franchi le pas</p>",
        "fontSize": 20,
        "textAlign": "center",
        "color": "#E0E7FF"
      },
      "displayName": "Text",
      "custom": {},
      "parent": "cta-content",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "cta-button": {
      "type": {
        "resolvedName": "Button"
      },
      "isCanvas": false,
      "props": {
        "text": "Réserver ma place maintenant",
        "link": "#inscription",
        "variant": "primary",
        "size": "large",
        "backgroundColor": "#FFFFFF",
        "textColor": "#4F46E5",
        "borderRadius": 8
      },
      "displayName": "Button",
      "custom": {},
      "parent": "cta-content",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "footer-section": {
      "type": {
        "resolvedName": "Footer"
      },
      "isCanvas": false,
      "props": {
        "companyName": "EventPro Academy",
        "logo": "",
        "description": "Formation en ligne de qualité pour professionnels ambitieux",
        "links": [
          {
            "title": "Webinars",
            "items": [
              { "label": "Prochains événements", "url": "#" },
              { "label": "Replays", "url": "#" },
              { "label": "Certificats", "url": "#" }
            ]
          },
          {
            "title": "Support",
            "items": [
              { "label": "Centre d''aide", "url": "/help" },
              { "label": "Contact", "url": "/contact" },
              { "label": "FAQ", "url": "#faq" }
            ]
          },
          {
            "title": "Légal",
            "items": [
              { "label": "Conditions d''utilisation", "url": "/terms" },
              { "label": "Confidentialité", "url": "/privacy" }
            ]
          }
        ],
        "socialLinks": [
          { "platform": "LinkedIn", "url": "https://linkedin.com" },
          { "platform": "Twitter", "url": "https://twitter.com" },
          { "platform": "Facebook", "url": "https://facebook.com" },
          { "platform": "Instagram", "url": "https://instagram.com" }
        ],
        "copyright": "© 2025 EventPro Academy. Tous droits réservés."
      },
      "displayName": "Footer",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    }
  }',
  true
) ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  schema = EXCLUDED.schema,
  updated_at = NOW();

-- Verify templates were inserted
SELECT id, key, label, category, is_public
FROM builder_templates
WHERE is_public = true
ORDER BY created_at DESC;
