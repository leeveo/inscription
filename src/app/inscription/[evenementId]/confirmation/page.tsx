'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import QrCodeCard from '@/components/qr/QrCodeCard'

export default function ConfirmationPage() {
  const { evenementId } = useParams()
  const [inscriptionId, setInscriptionId] = useState<string | null>(null)

  useEffect(() => {
    const fetchInscription = async () => {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()

      // Add a type assertion to handle the ParamValue type
      const { data, /* error */ } = await supabase
        .from('inscription_inscriptions')
        .select('id')
        .eq('evenement_id', evenementId as string)
        .eq('utilisateur_id', user?.id as string) // Add type assertion here
        .single()

      // Add a type assertion for data.id
      if (data) setInscriptionId(data.id as string)
    }

    fetchInscription()
  }, [evenementId])

  if (!inscriptionId) return <p>Chargement...</p>

  return (
    <div className="max-w-xl mx-auto mt-8 text-center">
      <h2 className="text-xl font-bold mb-4">Votre badge QR</h2>
      <p>Montrez ce QR Code lors de votre arrivée à l&apos;événement.</p>
      <div className="mt-4">
        <QrCodeCard value={inscriptionId} />
      </div>
    </div>
  )
}
