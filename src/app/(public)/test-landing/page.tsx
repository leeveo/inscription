// Page de test ultra-simple pour identifier le problème des landing pages
import { NextResponse } from 'next/server'

export default function TestLandingPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Test Landing Page - Version Minimale</h1>
      <p><strong>Status:</strong> ✅ Cette page se charge correctement</p>
      <p><strong>Date:</strong> {new Date().toISOString()}</p>
      <p><strong>Environnement:</strong> {process.env.NODE_ENV}</p>
      
      <h2>Étapes de test :</h2>
      <ol>
        <li>✅ Cette page se charge sans erreur 500</li>
        <li>⏳ Test de connexion Supabase...</li>
      </ol>
      
      <div style={{ backgroundColor: '#f0f8ff', padding: '15px', marginTop: '20px' }}>
        <h3>🔍 Diagnostic :</h3>
        <p>Si vous voyez cette page, le problème n'est PAS dans le routing Next.js.</p>
        <p>Le problème est probablement dans les fonctions server-side de la landing page complexe.</p>
      </div>
      
      <p style={{ color: '#666', fontSize: '12px' }}>
        URL: /test-landing - À supprimer après diagnostic
      </p>
    </div>
  )
}