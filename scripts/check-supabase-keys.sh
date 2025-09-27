#!/bin/bash
# Script pour récupérer les clés Supabase
# Utilisé pour debug les clés API

echo "=== VÉRIFICATION DES CLÉS SUPABASE ==="
echo ""

# Vérification de l'URL
echo "1. URL Supabase:"
echo "   $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Vérification de la clé anon (premiers et derniers caractères)
if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "2. Clé Anon (partielle):"
    echo "   ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}...${NEXT_PUBLIC_SUPABASE_ANON_KEY: -20}"
else
    echo "2. Clé Anon: ❌ MANQUANTE"
fi
echo ""

# Vérification de la clé service role
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "3. Clé Service Role (partielle):"
    echo "   ${SUPABASE_SERVICE_ROLE_KEY:0:20}...${SUPABASE_SERVICE_ROLE_KEY: -20}"
else
    echo "3. Clé Service Role: ❌ MANQUANTE"
fi
echo ""

echo "=== INSTRUCTIONS ==="
echo "1. Allez sur https://app.supabase.com"
echo "2. Sélectionnez votre projet"
echo "3. Settings > API"
echo "4. Copiez la 'service_role key'"
echo "5. Remplacez SUPABASE_SERVICE_ROLE_KEY dans .env.local"