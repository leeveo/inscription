# Scripts SQL pour le Page Builder

## Ordre d'exécution

### Pour ajouter les nouveaux templates avec toutes les fonctionnalités

Exécutez dans cet ordre dans Supabase SQL Editor :

1. **`add_template_columns.sql`** ✨
   - Ajoute les colonnes `is_system` et `tags` à la table `builder_templates`
   - Nécessaire pour le badge "Officiel" et le système de tags
   - Sans danger : utilise `ADD COLUMN IF NOT EXISTS`

2. **`insert_additional_templates.sql`** 📦
   - Insère 6 nouveaux templates avec images
   - Nécessite que l'étape 1 soit complétée

### Alternative rapide (sans nouvelles colonnes)

Si vous voulez juste les templates sans modifier la structure de la table :

- Exécutez uniquement **`insert_additional_templates_v2.sql`** 🚀
  - Fonctionne sans les colonnes `is_system` et `tags`
  - Les templates apparaîtront quand même dans la bibliothèque
  - Pas de badge "Officiel" ni de tags, mais tout le reste fonctionne

## Description des templates

### 1. Modern Landing Page
- **Catégorie**: Marketing
- **Image**: Photo de bureau moderne
- **Blocs**: Hero, Features Grid (3 colonnes), CTA
- **Couleur**: Gradient violet

### 2. Event Conference
- **Catégorie**: Event
- **Image**: Salle de conférence
- **Blocs**: Hero fullscreen, Countdown, Agenda, Speakers, Billetterie
- **Idéal pour**: Conférences tech, séminaires

### 3. Portfolio Showcase
- **Catégorie**: Portfolio
- **Image**: Design créatif
- **Blocs**: Hero, Gallery masonry, Testimonials carousel
- **Style**: Dark mode

### 4. Coming Soon
- **Catégorie**: Marketing
- **Image**: Gradient moderne
- **Blocs**: Hero, Countdown, Newsletter Form
- **Couleur**: Gradient violet/bleu

### 5. Contact Page
- **Catégorie**: Contact
- **Image**: Contact/communication
- **Blocs**: Hero, Contact Form (nom, email, message), Map
- **Localisation**: Paris par défaut

### 6. FAQ Page
- **Catégorie**: Support
- **Image**: Questions/aide
- **Blocs**: Hero, FAQ Accordion (3 questions par défaut)
- **Style**: Épuré

## Images utilisées

Toutes les images proviennent d'Unsplash avec des URLs optimisées :
- Format: `?w=600&h=400&fit=crop` pour les thumbnails
- Format: `?w=1920&h=1080&fit=crop` pour les backgrounds
- Licence: Gratuite et libre d'utilisation

## Dépannage

### Erreur "column does not exist"
➡️ Exécutez d'abord `add_template_columns.sql` ou utilisez `insert_additional_templates_v2.sql`

### Templates non visibles
- Vérifiez que `is_public = true`
- Rafraîchissez la page `/admin/builder/library`
- Vérifiez les logs dans la console navigateur

### Images non chargées
- Les URLs Unsplash sont publiques et ne nécessitent pas d'API key
- Vérifiez votre connexion internet
- Les images sont chargées depuis `images.unsplash.com`

## Personnalisation

Pour modifier un template :
1. Changez le contenu du champ `schema` (structure JSON Craft.js)
2. Modifiez `preview_image` avec votre propre URL
3. Ajustez `category`, `tags`, et `description`

Pour créer vos propres templates :
1. Créez une page dans le builder
2. Exportez le JSON de la structure
3. Créez un nouveau INSERT dans votre propre script SQL
4. Ajoutez une belle image de preview
