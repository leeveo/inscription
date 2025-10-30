-- Supprimer les anciens templates
DELETE FROM registration_form_templates WHERE key IN ('simple-form', 'professional-form', 'complete-form');

-- Template 1: Formulaire Simple (Nom, Email, Téléphone)
INSERT INTO registration_form_templates (key, label, description, category, schema) VALUES (
  'simple-form',
  'Formulaire Simple',
  'Formulaire basique avec nom, prénom, email et téléphone',
  'basic',
  '{
    "ROOT": {
      "type": "FormContainer",
      "isCanvas": true,
      "props": {
        "backgroundColor": "#ffffff",
        "padding": 32,
        "maxWidth": "800px"
      },
      "displayName": "Conteneur de formulaire",
      "custom": {},
      "parent": null,
      "hidden": false,
      "nodes": ["heading1", "desc1", "field1", "field2", "field3", "field4", "submit1"],
      "linkedNodes": {}
    },
    "heading1": {
      "type": "FormHeading",
      "isCanvas": false,
      "props": {
        "text": "Inscription à l''événement",
        "level": "h2",
        "textAlign": "center",
        "color": "#1F2937",
        "marginBottom": "1.5rem"
      },
      "displayName": "Titre du formulaire",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "desc1": {
      "type": "FormDescription",
      "isCanvas": false,
      "props": {
        "text": "Remplissez le formulaire ci-dessous pour confirmer votre participation.",
        "textAlign": "center",
        "color": "#6B7280",
        "marginBottom": "2rem"
      },
      "displayName": "Description du formulaire",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field1": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Prénom",
        "placeholder": "Entrez votre prénom",
        "fieldName": "prenom",
        "required": true,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field2": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Nom",
        "placeholder": "Entrez votre nom",
        "fieldName": "nom",
        "required": true,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field3": {
      "type": "EmailField",
      "isCanvas": false,
      "props": {
        "label": "Email",
        "placeholder": "votre@email.com",
        "fieldName": "email",
        "required": true,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ email",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field4": {
      "type": "PhoneField",
      "isCanvas": false,
      "props": {
        "label": "Téléphone",
        "placeholder": "06 12 34 56 78",
        "fieldName": "telephone",
        "required": true,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ téléphone",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "submit1": {
      "type": "SubmitButton",
      "isCanvas": false,
      "props": {
        "text": "S''inscrire",
        "size": "large",
        "backgroundColor": "#3B82F6",
        "textColor": "#ffffff",
        "fullWidth": true
      },
      "displayName": "Bouton",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    }
  }'::jsonb
);

-- Template 2: Formulaire Professionnel (+ Profession et Site web)
INSERT INTO registration_form_templates (key, label, description, category, schema) VALUES (
  'professional-form',
  'Formulaire Professionnel',
  'Formulaire avec informations professionnelles',
  'professional',
  '{
    "ROOT": {
      "type": "FormContainer",
      "isCanvas": true,
      "props": {
        "backgroundColor": "#ffffff",
        "padding": 32,
        "maxWidth": "800px"
      },
      "displayName": "Conteneur de formulaire",
      "custom": {},
      "parent": null,
      "hidden": false,
      "nodes": ["heading1", "desc1", "field1", "field2", "field3", "field4", "field5", "field6", "submit1"],
      "linkedNodes": {}
    },
    "heading1": {
      "type": "FormHeading",
      "isCanvas": false,
      "props": {
        "text": "Inscription Professionnelle",
        "level": "h2",
        "textAlign": "center",
        "color": "#1F2937",
        "marginBottom": "1rem"
      },
      "displayName": "Titre du formulaire",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "desc1": {
      "type": "FormDescription",
      "isCanvas": false,
      "props": {
        "text": "Rejoignez notre réseau professionnel en remplissant ce formulaire.",
        "textAlign": "center",
        "color": "#6B7280",
        "marginBottom": "2rem"
      },
      "displayName": "Description du formulaire",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field1": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Prénom",
        "placeholder": "Votre prénom",
        "fieldName": "prenom",
        "required": true,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field2": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Nom",
        "placeholder": "Votre nom",
        "fieldName": "nom",
        "required": true,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field3": {
      "type": "EmailField",
      "isCanvas": false,
      "props": {
        "label": "Email professionnel",
        "placeholder": "prenom.nom@entreprise.com",
        "fieldName": "email",
        "required": true,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ email",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field4": {
      "type": "PhoneField",
      "isCanvas": false,
      "props": {
        "label": "Téléphone",
        "placeholder": "06 12 34 56 78",
        "fieldName": "telephone",
        "required": true,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ téléphone",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field5": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Profession",
        "placeholder": "Votre fonction",
        "fieldName": "profession",
        "required": false,
        "helperText": "Ex: Développeur, Chef de projet...",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field6": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Site web",
        "placeholder": "https://...",
        "fieldName": "site_web",
        "required": false,
        "helperText": "Votre site professionnel ou LinkedIn",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "submit1": {
      "type": "SubmitButton",
      "isCanvas": false,
      "props": {
        "text": "Confirmer mon inscription",
        "size": "large",
        "backgroundColor": "#3B82F6",
        "textColor": "#ffffff",
        "fullWidth": true
      },
      "displayName": "Bouton",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    }
  }'::jsonb
);

-- Template 3: Formulaire Complet (+ Réseaux sociaux, Date naissance, CGU)
INSERT INTO registration_form_templates (key, label, description, category, schema) VALUES (
  'complete-form',
  'Formulaire Complet',
  'Formulaire détaillé avec réseaux sociaux et conditions',
  'advanced',
  '{
    "ROOT": {
      "type": "FormContainer",
      "isCanvas": true,
      "props": {
        "backgroundColor": "#ffffff",
        "padding": 32,
        "maxWidth": "900px"
      },
      "displayName": "Conteneur de formulaire",
      "custom": {},
      "parent": null,
      "hidden": false,
      "nodes": ["heading1", "desc1", "heading2", "field1", "field2", "field3", "field4", "field5", "field6", "field7", "heading3", "field8", "field9", "field10", "field11", "field12", "checkbox1", "submit1"],
      "linkedNodes": {}
    },
    "heading1": {
      "type": "FormHeading",
      "isCanvas": false,
      "props": {
        "text": "Inscription Complète",
        "level": "h1",
        "textAlign": "center",
        "color": "#1F2937",
        "marginBottom": "0.5rem"
      },
      "displayName": "Titre du formulaire",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "desc1": {
      "type": "FormDescription",
      "isCanvas": false,
      "props": {
        "text": "Merci de remplir tous les champs pour finaliser votre inscription.",
        "textAlign": "center",
        "color": "#6B7280",
        "marginBottom": "2rem"
      },
      "displayName": "Description du formulaire",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "heading2": {
      "type": "FormHeading",
      "isCanvas": false,
      "props": {
        "text": "Informations personnelles",
        "level": "h3",
        "textAlign": "left",
        "color": "#374151",
        "marginBottom": "1rem"
      },
      "displayName": "Titre du formulaire",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field1": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Prénom",
        "placeholder": "Votre prénom",
        "fieldName": "prenom",
        "required": true,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field2": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Nom",
        "placeholder": "Votre nom",
        "fieldName": "nom",
        "required": true,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field3": {
      "type": "EmailField",
      "isCanvas": false,
      "props": {
        "label": "Email",
        "placeholder": "votre@email.com",
        "fieldName": "email",
        "required": true,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ email",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field4": {
      "type": "PhoneField",
      "isCanvas": false,
      "props": {
        "label": "Téléphone",
        "placeholder": "06 12 34 56 78",
        "fieldName": "telephone",
        "required": true,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ téléphone",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field5": {
      "type": "DateField",
      "isCanvas": false,
      "props": {
        "label": "Date de naissance",
        "fieldName": "date_naissance",
        "required": false,
        "helperText": "",
        "defaultValue": "",
        "minDate": "",
        "maxDate": ""
      },
      "displayName": "Champ date",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field6": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Profession",
        "placeholder": "Votre fonction",
        "fieldName": "profession",
        "required": false,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field7": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Site web",
        "placeholder": "https://...",
        "fieldName": "site_web",
        "required": false,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "heading3": {
      "type": "FormHeading",
      "isCanvas": false,
      "props": {
        "text": "Réseaux sociaux",
        "level": "h3",
        "textAlign": "left",
        "color": "#374151",
        "marginBottom": "1rem"
      },
      "displayName": "Titre du formulaire",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field8": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "LinkedIn",
        "placeholder": "URL de votre profil LinkedIn",
        "fieldName": "url_linkedin",
        "required": false,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field9": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Facebook",
        "placeholder": "URL de votre profil Facebook",
        "fieldName": "url_facebook",
        "required": false,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field10": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Twitter/X",
        "placeholder": "URL de votre profil Twitter",
        "fieldName": "url_twitter",
        "required": false,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field11": {
      "type": "TextField",
      "isCanvas": false,
      "props": {
        "label": "Instagram",
        "placeholder": "URL de votre profil Instagram",
        "fieldName": "url_instagram",
        "required": false,
        "helperText": "",
        "defaultValue": ""
      },
      "displayName": "Champ texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "field12": {
      "type": "TextAreaField",
      "isCanvas": false,
      "props": {
        "label": "Message (optionnel)",
        "placeholder": "Avez-vous des questions ou des besoins particuliers ?",
        "fieldName": "message",
        "required": false,
        "helperText": "",
        "rows": 4,
        "defaultValue": ""
      },
      "displayName": "Zone de texte",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "checkbox1": {
      "type": "CheckboxField",
      "isCanvas": false,
      "props": {
        "label": "J''accepte les conditions générales d''utilisation",
        "fieldName": "accept_cgu",
        "required": true,
        "helperText": "",
        "defaultChecked": false
      },
      "displayName": "Case à cocher",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    },
    "submit1": {
      "type": "SubmitButton",
      "isCanvas": false,
      "props": {
        "text": "Valider mon inscription",
        "size": "large",
        "backgroundColor": "#3B82F6",
        "textColor": "#ffffff",
        "fullWidth": true
      },
      "displayName": "Bouton",
      "custom": {},
      "parent": "ROOT",
      "hidden": false,
      "nodes": [],
      "linkedNodes": {}
    }
  }'::jsonb
);
