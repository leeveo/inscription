'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CalendarIcon,
  CogIcon,
  EnvelopeIcon,
  ChartBarIcon,
  QrCodeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface Section {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
  subsections?: Array<{
    id: string
    title: string
    content: React.ReactNode
  }>
}

export default function DocumentationPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']))

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const sections: Section[] = [
    {
      id: 'getting-started',
      title: 'Premiers pas',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 Bienvenue dans Waivent</h3>
            <p className="text-blue-800 mb-4">
              Waivent est votre plateforme complète de gestion d'événements. Elle vous permet de :
            </p>
            <ul className="list-disc list-inside text-blue-800 space-y-2">
              <li><strong>Créer et gérer</strong> vos événements</li>
              <li><strong>Organiser</strong> des sessions et agendas</li>
              <li><strong>Gérer</strong> les inscriptions participants</li>
              <li><strong>Envoyer</strong> des emails personnalisés</li>
              <li><strong>Créer</strong> des landing pages d'inscription</li>
              <li><strong>Suivre</strong> les statistiques et analytics</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Architecture du système</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-green-700 mb-2">🌐 Domaines</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><code>admin.waivent.app</code> - Interface admin</li>
                  <li><code>waivent.app</code> - Landing pages publiques</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-blue-700 mb-2">🔧 Technologies</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>Next.js 14 + TypeScript</li>
                  <li>Supabase (Base de données)</li>
                  <li>Brevo (Emails)</li>
                  <li>TailwindCSS</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚡ Accès rapide</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/admin/dashboard" className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow border">
                <div className="text-blue-600 mb-2">📊</div>
                <div className="text-sm font-medium">Dashboard</div>
              </Link>
              <Link href="/admin/evenements/create" className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow border">
                <div className="text-green-600 mb-2">➕</div>
                <div className="text-sm font-medium">Nouvel événement</div>
              </Link>
              <Link href="/admin/evenements" className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow border">
                <div className="text-purple-600 mb-2">📅</div>
                <div className="text-sm font-medium">Événements</div>
              </Link>
              <Link href="/scanner" target="_blank" className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow border">
                <div className="text-indigo-600 mb-2">📱</div>
                <div className="text-sm font-medium">Scanner</div>
              </Link>
            </div>
          </div>
        </div>
      )
    },

    {
      id: 'event-creation',
      title: 'Création d\'événements',
      icon: <CalendarIcon className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🎯 Processus de création d'événement</h3>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900 mb-2">Informations de base</h4>
                  <p className="text-gray-600 mb-3">Renseignez les informations essentielles de votre événement :</p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>• Nom de l'événement</strong><br/>
                        <span className="text-gray-600">Titre principal qui apparaîtra partout</span>
                      </div>
                      <div>
                        <strong>• Date et heure</strong><br/>
                        <span className="text-gray-600">Date de début et de fin</span>
                      </div>
                      <div>
                        <strong>• Lieu</strong><br/>
                        <span className="text-gray-600">Adresse ou plateforme en ligne</span>
                      </div>
                      <div>
                        <strong>• Type d'événement</strong><br/>
                        <span className="text-gray-600">Conférence, atelier, webinar...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900 mb-2">Description détaillée</h4>
                  <p className="text-gray-600 mb-3">Utilisez l'éditeur riche pour créer une description attrayante :</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="text-sm space-y-1">
                      <li>• <strong>Éditeur WYSIWYG</strong> - Formatage visuel</li>
                      <li>• <strong>Images et médias</strong> - Ajoutez des visuels</li>
                      <li>• <strong>Mise en forme</strong> - Titres, listes, liens</li>
                      <li>• <strong>Prévisualisation</strong> - Voir le rendu final</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900 mb-2">Configuration avancée</h4>
                  <p className="text-gray-600 mb-3">Personnalisez votre événement :</p>
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>🖼️ Logo/Image</strong><br/>
                      <span className="text-gray-600">Upload via UploadThing</span>
                    </div>
                    <div>
                      <strong>👥 Capacité</strong><br/>
                      <span className="text-gray-600">Nombre de participants max</span>
                    </div>
                    <div>
                      <strong>🎭 Type participation</strong><br/>
                      <span className="text-gray-600">Présentiel, virtuel, hybride</span>
                    </div>
                    <div>
                      <strong>📊 Statut</strong><br/>
                      <span className="text-gray-600">Brouillon, publié, archivé</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-3">💡 Bonnes pratiques</h3>
            <ul className="text-amber-700 space-y-2">
              <li>• <strong>Description claire</strong> : Expliquez le contenu et les bénéfices</li>
              <li>• <strong>Image attractive</strong> : Une image de qualité augmente les inscriptions</li>
              <li>• <strong>Informations complètes</strong> : Lieu précis, horaires, prérequis</li>
              <li>• <strong>Sauvegarde régulière</strong> : Utilisez "Brouillon" pour sauvegarder</li>
            </ul>
          </div>
        </div>
      )
    },

    {
      id: 'session-management',
      title: 'Gestion des sessions',
      icon: <CogIcon className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">📋 Agenda et sessions</h3>
            
            <p className="text-gray-600 mb-6">
              Créez un agenda détaillé avec des sessions spécifiques pour votre événement. 
              Les participants pourront s'inscrire aux sessions qui les intéressent.
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">➕ Création de session</h4>
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Titre de la session</strong><br/>
                      <span className="text-gray-600">Nom descriptif et accrocheur</span>
                    </div>
                    <div>
                      <strong>Intervenant</strong><br/>
                      <span className="text-gray-600">Nom du présentateur/animateur</span>
                    </div>
                    <div>
                      <strong>Date et horaires</strong><br/>
                      <span className="text-gray-600">Heure de début et de fin</span>
                    </div>
                    <div>
                      <strong>Lieu/Salle</strong><br/>
                      <span className="text-gray-600">Localisation spécifique</span>
                    </div>
                  </div>
                  <div>
                    <strong>Description</strong><br/>
                    <span className="text-gray-600">Contenu détaillé, objectifs, prérequis</span>
                  </div>
                  <div>
                    <strong>Type de session</strong><br/>
                    <span className="text-gray-600">Conférence, atelier, table-ronde, pause...</span>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">👥 Gestion des inscriptions</h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <ul className="text-sm space-y-2">
                    <li>• <strong>Inscription libre</strong> : Les participants choisissent leurs sessions</li>
                    <li>• <strong>Capacité limitée</strong> : Définissez un nombre max par session</li>
                    <li>• <strong>Liste d'attente</strong> : Gestion automatique des places libérées</li>
                    <li>• <strong>Statistiques</strong> : Suivi du taux de remplissage</li>
                  </ul>
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">📊 Suivi et analytics</h4>
                <div className="bg-purple-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>📈 Participations</strong><br/>
                    <span className="text-gray-600">Nombre d'inscrits/session</span>
                  </div>
                  <div>
                    <strong>⭐ Popularité</strong><br/>
                    <span className="text-gray-600">Sessions les plus demandées</span>
                  </div>
                  <div>
                    <strong>⏰ Conflits</strong><br/>
                    <span className="text-gray-600">Détection horaires</span>
                  </div>
                  <div>
                    <strong>📧 Communication</strong><br/>
                    <span className="text-gray-600">Emails par session</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    {
      id: 'participant-management',
      title: 'Gestion des participants',
      icon: <UserGroupIcon className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">👥 Participants et inscriptions</h3>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">📥 Méthodes d'inscription</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="text-2xl mb-2">🌐</div>
                    <h5 className="font-semibold mb-2">Landing Pages</h5>
                    <p className="text-sm text-gray-600">Inscription publique via waivent.app</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="text-2xl mb-2">📤</div>
                    <h5 className="font-semibold mb-2">Import CSV</h5>
                    <p className="text-sm text-gray-600">Import en masse de participants</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="text-2xl mb-2">✏️</div>
                    <h5 className="font-semibold mb-2">Saisie manuelle</h5>
                    <p className="text-sm text-gray-600">Ajout individuel depuis l'admin</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <h4 className="font-semibold text-gray-900">📋 Informations collectées</h4>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3">Informations obligatoires</h5>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Nom et prénom</strong></li>
                        <li>• <strong>Email</strong> (identifiant unique)</li>
                        <li>• <strong>Choix des sessions</strong></li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3">Informations optionnelles</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Téléphone</li>
                        <li>• Profession/Entreprise</li>
                        <li>• Date de naissance</li>
                        <li>• Réseaux sociaux</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-3">🔗 URLs personnalisées</h4>
                <p className="text-green-800 mb-4">
                  Générez des liens d'inscription personnalisés pour chaque participant :
                </p>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">https://waivent.app/landing/[event-id]/[token]</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Token unique par participant</li>
                    <li>• Pré-remplissage automatique des informations</li>
                    <li>• Tracking des visites et conversions</li>
                    <li>• Parfait pour les campagnes email marketing</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-900 mb-3">📊 Statuts des participants</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center border">
                    <div className="text-blue-600 mb-1">👤</div>
                    <div className="text-sm font-medium">Inscrit</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border">
                    <div className="text-green-600 mb-1">✅</div>
                    <div className="text-sm font-medium">Confirmé</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border">
                    <div className="text-purple-600 mb-1">🎫</div>
                    <div className="text-sm font-medium">Ticket envoyé</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border">
                    <div className="text-indigo-600 mb-1">📱</div>
                    <div className="text-sm font-medium">Check-in fait</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    {
      id: 'email-system',
      title: 'Système d\'emails',
      icon: <EnvelopeIcon className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">📧 Communication par email</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">🔧 Fournisseur : Brevo (ex-SendInBlue)</h4>
              <p className="text-blue-800 text-sm">
                Tous les emails sont envoyés via Brevo pour garantir une délivrabilité optimale.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-3">📝 Templates d'emails personnalisables</h4>
                <div className="bg-green-50 rounded-lg p-4 space-y-3">
                  <p className="text-green-800 text-sm">
                    Créez des templates personnalisés pour chaque événement avec l'éditeur intégré :
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-green-800">🎨 Éditeur WYSIWYG</strong>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>• Interface visuelle intuitive</li>
                        <li>• Formatage riche (gras, italique, liens)</li>
                        <li>• Aperçu en temps réel</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-green-800">📱 Templates pré-conçus</strong>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>• Invitation moderne</li>
                        <li>• Professionnel élégant</li>
                        <li>• Coloré & dynamique</li>
                        <li>• Conférence académique</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-3">🏷️ Variables personnalisables</h4>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-purple-800">📅 Événement</strong>
                      <ul className="text-purple-700 mt-2 space-y-1">
                        <li><code>{'{{event_name}}'}</code> - Nom de l'événement</li>
                        <li><code>{'{{event_date}}'}</code> - Date formatée</li>
                        <li><code>{'{{event_location}}'}</code> - Lieu</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-purple-800">👤 Participant</strong>
                      <ul className="text-purple-700 mt-2 space-y-1">
                        <li><code>{'{{participant_firstname}}'}</code> - Prénom</li>
                        <li><code>{'{{participant_lastname}}'}</code> - Nom</li>
                        <li><code>{'{{participant_email}}'}</code> - Email</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-purple-800">🔗 Liens</strong>
                      <ul className="text-purple-700 mt-2 space-y-1">
                        <li><code>{'{{ticket_url}}'}</code> - Lien ticket (admin)</li>
                        <li><code>{'{{landing_url}}'}</code> - Lien inscription (public)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-3">📬 Types d'emails automatiques</h4>
                <div className="space-y-3">
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-orange-100 rounded-full p-2">
                        <span className="text-orange-600 text-sm">📩</span>
                      </div>
                      <strong className="text-orange-900">Email d'inscription</strong>
                    </div>
                    <p className="text-orange-800 text-sm">
                      Envoyé automatiquement avec le lien personnalisé waivent.app pour finaliser l'inscription
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <span className="text-blue-600 text-sm">🎫</span>
                      </div>
                      <strong className="text-blue-900">Email de ticket</strong>
                    </div>
                    <p className="text-blue-800 text-sm">
                      Confirmation avec QR code et détails des sessions choisies
                    </p>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-yellow-100 rounded-full p-2">
                        <span className="text-yellow-600 text-sm">⏰</span>
                      </div>
                      <strong className="text-yellow-900">Rappels</strong>
                    </div>
                    <p className="text-yellow-800 text-sm">
                      Rappels automatiques 24h et 1h avant l'événement
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">📈 Analytics emails</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-600 mb-1">📤</div>
                    <div className="font-medium">Envoyés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600 mb-1">👁️</div>
                    <div className="font-medium">Ouverts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-600 mb-1">🔗</div>
                    <div className="font-medium">Cliqués</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 mb-1">❌</div>
                    <div className="font-medium">Bounces</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    {
      id: 'landing-pages',
      title: 'Landing pages',
      icon: <GlobeAltIcon className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🌐 Pages d'inscription publiques</h3>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-900 mb-2">🎯 Domaine public : waivent.app</h4>
              <p className="text-green-800 text-sm">
                Toutes les landing pages sont hébergées sur le domaine public pour une meilleure accessibilité.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-3">🎨 Templates de landing pages</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 border">
                      <h5 className="font-semibold mb-2 text-blue-900">🎯 Modern Event</h5>
                      <p className="text-sm text-gray-600 mb-2">Design épuré et moderne</p>
                      <div className="text-xs text-blue-600">✓ Countdown • ✓ Responsive</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                      <h5 className="font-semibold mb-2 text-green-900">🎪 Creative Event</h5>
                      <p className="text-sm text-gray-600 mb-2">Coloré et créatif</p>
                      <div className="text-xs text-green-600">✓ Animations • ✓ Galerie</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                      <h5 className="font-semibold mb-2 text-purple-900">💼 Conference Pro</h5>
                      <p className="text-sm text-gray-600 mb-2">Événements professionnels</p>
                      <div className="text-xs text-purple-600">✓ Planning • ✓ Premium</div>
                    </div>
                  </div>
                  <p className="text-blue-800 text-sm">
                    Chaque template est entièrement personnalisable avec vos couleurs, logo et contenu.
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-3">⚙️ Configuration des landing pages</h4>
                <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-purple-800">🎨 Personnalisation visuelle</strong>
                      <ul className="text-sm text-purple-700 mt-1 space-y-1">
                        <li>• Couleurs principales et secondaires</li>
                        <li>• Logo et images de fond</li>
                        <li>• Polices et typographie</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-purple-800">📝 Contenu</strong>
                      <ul className="text-sm text-purple-700 mt-1 space-y-1">
                        <li>• Titre et sous-titre accrocheurs</li>
                        <li>• Description détaillée</li>
                        <li>• Call-to-action personnalisé</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <strong className="text-purple-800">🔧 Fonctionnalités avancées</strong>
                    <ul className="text-sm text-purple-700 mt-1 space-y-1 grid grid-cols-2 gap-1">
                      <li>• Countdown timer</li>
                      <li>• Galerie d'images</li>
                      <li>• Intégration réseaux sociaux</li>
                      <li>• Formulaire d'inscription</li>
                      <li>• Sélection des sessions</li>
                      <li>• Témoignages</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-3">🔗 Types d'URLs</h4>
                <div className="bg-orange-50 rounded-lg p-4 space-y-4">
                  <div>
                    <strong className="text-orange-800">URL générale</strong>
                    <div className="bg-white rounded p-2 mt-1 font-mono text-sm">
                      https://waivent.app/landing/[event-id]
                    </div>
                    <p className="text-orange-700 text-sm mt-1">
                      Page d'inscription ouverte à tous
                    </p>
                  </div>
                  <div>
                    <strong className="text-orange-800">URL personnalisée</strong>
                    <div className="bg-white rounded p-2 mt-1 font-mono text-sm">
                      https://waivent.app/landing/[event-id]/[token]
                    </div>
                    <p className="text-orange-700 text-sm mt-1">
                      Lien unique par participant avec pré-remplissage
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-900 mb-3">📊 Analytics et tracking</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center border">
                    <div className="text-blue-600 mb-1">👁️</div>
                    <div className="text-sm font-medium">Visites</div>
                    <div className="text-xs text-gray-500">Pages vues</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border">
                    <div className="text-green-600 mb-1">✅</div>
                    <div className="text-sm font-medium">Conversions</div>
                    <div className="text-xs text-gray-500">Inscriptions</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border">
                    <div className="text-purple-600 mb-1">📈</div>
                    <div className="text-sm font-medium">Taux</div>
                    <div className="text-xs text-gray-500">Conversion %</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border">
                    <div className="text-orange-600 mb-1">🌍</div>
                    <div className="text-sm font-medium">Source</div>
                    <div className="text-xs text-gray-500">Origine trafic</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    {
      id: 'qr-checkin',
      title: 'QR Code & Check-in',
      icon: <QrCodeIcon className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">📱 Système de check-in</h3>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-indigo-900 mb-2">🎯 Scanner mobile : /scanner</h4>
              <p className="text-indigo-800 text-sm">
                Interface de scan optimisée pour mobile, accessible directement via admin.waivent.app/scanner
              </p>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-3">🎫 Génération des tickets</h4>
                <div className="bg-green-50 rounded-lg p-4 space-y-3">
                  <p className="text-green-800 text-sm">
                    Chaque participant reçoit un ticket unique avec QR code :
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-green-800">📧 Email de ticket</strong>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>• QR code intégré dans l'email</li>
                        <li>• Informations événement et sessions</li>
                        <li>• Token unique et sécurisé</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-green-800">🔐 Sécurité</strong>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>• Token de 32 caractères</li>
                        <li>• Lien unique non-partageable</li>
                        <li>• Validation côté serveur</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibant text-gray-900 mb-3">📷 Processus de scan</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <strong className="text-blue-900">Ouverture du scanner</strong>
                        <p className="text-blue-800 text-sm mt-1">
                          Accès direct via /scanner sur mobile ou tablette
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <strong className="text-blue-900">Scan du QR code</strong>
                        <p className="text-blue-800 text-sm mt-1">
                          Camera intégrée avec détection automatique
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <strong className="text-blue-900">Validation et check-in</strong>
                        <p className="text-blue-800 text-sm mt-1">
                          Vérification du token et enregistrement de la présence
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-3">📊 Suivi des présences</h4>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 text-center border">
                      <div className="text-green-600 mb-1">✅</div>
                      <div className="text-sm font-medium">Check-in</div>
                      <div className="text-xs text-gray-500">Présents</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border">
                      <div className="text-red-600 mb-1">❌</div>
                      <div className="text-sm font-medium">Absents</div>
                      <div className="text-xs text-gray-500">Non présents</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border">
                      <div className="text-blue-600 mb-1">📊</div>
                      <div className="text-sm font-medium">Taux</div>
                      <div className="text-xs text-gray-500">Présence %</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border">
                      <div className="text-orange-600 mb-1">⏰</div>
                      <div className="text-sm font-medium">Heure</div>
                      <div className="text-xs text-gray-500">Arrivée</div>
                    </div>
                  </div>
                  <p className="text-purple-800 text-sm">
                    Suivi en temps réel des arrivées avec horodatage précis
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h4 className="font-semibant text-orange-900 mb-3">🛠️ Fonctionnalités avancées</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-orange-800">📱 Interface mobile</strong>
                    <ul className="text-sm text-orange-700 mt-1 space-y-1">
                      <li>• Design responsive</li>
                      <li>• Mode plein écran</li>
                      <li>• Feedback visuel et sonore</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-orange-800">🔍 Validation avancée</strong>
                    <ul className="text-sm text-orange-700 mt-1 space-y-1">
                      <li>• Détection des doublons</li>
                      <li>• Vérification de l'événement</li>
                      <li>• Gestion des erreurs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    {
      id: 'analytics',
      title: 'Analytics & Statistiques',
      icon: <ChartBarIcon className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">📊 Tableaux de bord et analyses</h3>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">📈 Dashboard principal</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="text-2xl mb-2">📅</div>
                    <div className="text-sm font-medium">Total Événements</div>
                    <div className="text-xs text-gray-500">Nombre d'événements créés</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="text-2xl mb-2">🔜</div>
                    <div className="text-sm font-medium">À venir</div>
                    <div className="text-xs text-gray-500">Événements futurs</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="text-sm font-medium">Participants</div>
                    <div className="text-xs text-gray-500">Total inscrits</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm font-medium">Ce mois</div>
                    <div className="text-xs text-gray-500">Nouvelles inscriptions</div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-3">📋 Statistiques par événement</h4>
                <div className="bg-green-50 rounded-lg p-4 space-y-3">
                  <p className="text-green-800 text-sm">
                    Analyses détaillées pour chaque événement :
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <strong className="text-green-800">👥 Participants</strong>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>• Nombre d'inscrits</li>
                        <li>• Taux de présence</li>
                        <li>• Répartition par session</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-green-800">📧 Emails</strong>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>• Taux d'ouverture</li>
                        <li>• Taux de clic</li>
                        <li>• Bounces et erreurs</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-green-800">🌐 Landing pages</strong>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>• Visites et conversions</li>
                        <li>• Sources de trafic</li>
                        <li>• Performance par template</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibant text-gray-900 mb-3">📊 Analytics avancées</h4>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <strong className="text-purple-800">🎯 Conversion tracking</strong>
                      <p className="text-purple-700 text-sm mt-1">
                        Suivi du parcours complet : email → landing page → inscription → check-in
                      </p>
                    </div>
                    <div>
                      <strong className="text-purple-800">📈 Tendances temporelles</strong>
                      <p className="text-purple-700 text-sm mt-1">
                        Évolution des inscriptions dans le temps, pics d'activité
                      </p>
                    </div>
                    <div>
                      <strong className="text-purple-800">🎪 Comparaison d'événements</strong>
                      <p className="text-purple-700 text-sm mt-1">
                        Benchmarking et identification des meilleures pratiques
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibant text-gray-900 mb-3">📱 Rapports et exports</h4>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-orange-800">📄 Formats disponibles</strong>
                      <ul className="text-sm text-orange-700 mt-1 space-y-1">
                        <li>• Export CSV participants</li>
                        <li>• Rapports PDF</li>
                        <li>• Données JSON (API)</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-orange-800">📊 Métriques clés</strong>
                      <ul className="text-sm text-orange-700 mt-1 space-y-1">
                        <li>• ROI par canal</li>
                        <li>• Coût par inscription</li>
                        <li>• Lifetime value</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibant text-blue-900 mb-3">🎯 Optimisation continue</h4>
                <div className="space-y-3">
                  <p className="text-blue-800 text-sm">
                    Utilisez les analytics pour optimiser vos événements :
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-blue-800">📧 A/B Testing emails</strong>
                      <p className="text-blue-700 text-sm">
                        Testez différents sujets et contenus
                      </p>
                    </div>
                    <div>
                      <strong className="text-blue-800">🌐 Optimisation landing</strong>
                      <p className="text-blue-700 text-sm">
                        Améliorez les taux de conversion
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec le même gradient que la sidebar */}
      <div className="relative overflow-hidden">
        {/* Background avec dégradé Web 3.0 identique à la sidebar */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-cyan-400/10"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        {/* Effet de particules/mesh moderne identique */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 left-8 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
          <div className="absolute top-6 right-12 w-24 h-24 bg-cyan-300/15 rounded-full blur-lg"></div>
          <div className="absolute bottom-2 left-16 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                📚 Documentation Waivent
              </h1>
              <p className="text-blue-200/80 mt-2">Guide complet de votre plateforme de gestion d'événements</p>
            </div>
            <div className="flex space-x-2">
              <Link 
                href="/admin/dashboard"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
              >
                ← Retour au dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Table des matières</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors py-1"
                  >
                    {section.icon}
                    <span>{section.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-3/4">
            <div className="space-y-8">
              {sections.map((section) => (
                <div key={section.id} id={section.id}>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        {section.icon}
                        <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                      </div>
                      {expandedSections.has(section.id) ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.has(section.id) && (
                      <div className="px-6 py-6">
                        {section.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Prêt à créer votre premier événement ?</h3>
                <p className="text-gray-600 mb-4">
                  Utilisez tous les outils à votre disposition pour créer des événements mémorables
                </p>
                <div className="flex justify-center space-x-4">
                  <Link 
                    href="/admin/evenements/create"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    ➕ Créer un événement
                  </Link>
                  <Link 
                    href="/admin/dashboard"
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all"
                  >
                    📊 Voir le dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}