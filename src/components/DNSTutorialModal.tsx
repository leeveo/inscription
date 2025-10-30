'use client'

interface DNSTutorialModalProps {
  isOpen: boolean
  onClose: () => void
  domainType: 'subdomain' | 'custom'
  domainName: string
  dnsConfig: {
    type: 'CNAME' | 'A'
    name: string
    value: string
  }
}

export default function DNSTutorialModal({
  isOpen,
  onClose,
  domainType,
  domainName,
  dnsConfig
}: DNSTutorialModalProps) {
  if (!isOpen) return null

  const getProviderInstructions = (provider: string) => {
    const instructions = {
      godaddy: {
        name: 'GoDaddy',
        steps: [
          'Connectez-vous à votre compte GoDaddy',
          'Allez dans "Domaines" et cliquez sur votre domaine',
          'Cliquez sur "Gérer DNS"',
          'Cliquez sur "Ajouter" ou modifiez un enregistrement existant',
          'Entrez les informations fournies et sauvegardez'
        ]
      },
      ovh: {
        name: 'OVH',
        steps: [
          'Connectez-vous à votre compte OVH',
          'Allez dans "Domaines" et sélectionnez votre domaine',
          'Cliquez sur l\'onglet "Zone DNS"',
          'Cliquez sur "Ajouter une entrée"',
          'Sélectionnez le type et entrez les informations fournies'
        ]
      },
      cloudflare: {
        name: 'Cloudflare',
        steps: [
          'Connectez-vous à votre compte Cloudflare',
          'Sélectionnez votre domaine',
          'Cliquez sur "DNS" dans le menu de gauche',
          'Cliquez sur "Add record"',
          'Entrez les informations fournies et sauvegardez'
        ]
      },
      namecheap: {
        name: 'Namecheap',
        steps: [
          'Connectez-vous à votre compte Namecheap',
          'Allez dans "Domain List" et cliquez sur "Manage" pour votre domaine',
          'Cliquez sur "Advanced DNS"',
          'Cliquez sur "Add New Record"',
          'Entrez les informations fournies et sauvegardez'
        ]
      }
    }

    return instructions[provider as keyof typeof instructions] || instructions.godaddy
  }

  const currentProvider = getProviderInstructions('godaddy')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            📚 Tutoriel de Configuration DNS
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Domain Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Configuration requise pour</h3>
            <div className="font-mono text-blue-800 mb-2">{domainName}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Type:</span> {dnsConfig.type}
              </div>
              <div>
                <span className="font-medium">Nom:</span> {dnsConfig.name}
              </div>
              <div>
                <span className="font-medium">Valeur:</span> {dnsConfig.value}
              </div>
            </div>
          </div>

          {/* General Instructions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 Qu'est-ce que cette configuration ?
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <p>
                Pour que votre domaine personnalisé pointe vers votre page événement,
                vous devez créer un enregistrement DNS qui fait le lien entre votre nom de domaine
                et nos serveurs.
              </p>
              {domainType === 'subdomain' ? (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Enregistrement CNAME</h4>
                  <p className="text-sm text-gray-600">
                    Un enregistrement CNAME pointe votre sous-domaine vers un autre nom de domaine.
                    C'est la méthode recommandée pour les sous-domaines.
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Enregistrement A</h4>
                  <p className="text-sm text-gray-600">
                    Un enregistrement A pointe directement votre domaine vers une adresse IP.
                    C'est nécessaire pour les domaines principaux.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Provider-specific instructions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🖥️ Instructions par fournisseur
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Godaddy Instructions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">🔵</span> {getProviderInstructions('godaddy').name}
                </h4>
                <ol className="space-y-2 text-sm text-gray-700">
                  {getProviderInstructions('godaddy').steps.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="font-medium mr-2">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* OVH Instructions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">🔵</span> {getProviderInstructions('ovh').name}
                </h4>
                <ol className="space-y-2 text-sm text-gray-700">
                  {getProviderInstructions('ovh').steps.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="font-medium mr-2">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Cloudflare Instructions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">🟠</span> {getProviderInstructions('cloudflare').name}
                </h4>
                <ol className="space-y-2 text-sm text-gray-700">
                  {getProviderInstructions('cloudflare').steps.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="font-medium mr-2">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Namecheap Instructions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">🟢</span> {getProviderInstructions('namecheap').name}
                </h4>
                <ol className="space-y-2 text-sm text-gray-700">
                  {getProviderInstructions('namecheap').steps.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="font-medium mr-2">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Verification Timeline */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⏱️ Délais de propagation DNS
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Important</h4>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• La propagation DNS peut prendre de 5 minutes à 48 heures</li>
                <li>• Pendant ce temps, votre domaine peut ne pas être accessible</li>
                <li>• Vous pouvez vérifier le statut depuis notre interface de gestion</li>
                <li>• Une fois vérifié, le certificat SSL sera automatiquement provisionné</li>
              </ul>
            </div>
          </div>

          {/* Troubleshooting */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🛠️ Dépannage
            </h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Le domaine ne s'affiche pas ?</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Vérifiez que l'enregistrement DNS est correctement configuré</li>
                  <li>• Attendez la fin de la période de propagation</li>
                  <li>• Utilisez un outil en ligne comme dnschecker.org pour vérifier</li>
                  <li>• Essayez d'accéder au domaine en navigation privée</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Le certificat SSL n'est pas actif ?</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Le SSL est provisionné automatiquement après vérification DNS</li>
                  <li>• Cela peut prendre jusqu'à 5 minutes après la vérification</li>
                  <li>• Vérifiez que le DNS est bien configuré avant le SSL</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  )
}