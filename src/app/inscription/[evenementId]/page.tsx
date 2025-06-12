// src/app/inscription/[evenementId]/page.tsx
'use client'

import { useForm } from 'react-hook-form'
import { useParams, useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function InscriptionPage() {
  const router = useRouter()
  const { evenementId } = useParams()
  const { handleSubmit } = useForm()

  const onSubmit = async () => {
    const supabase = supabaseBrowser()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('inscription_inscriptions')
      .insert({
        utilisateur_id: user?.id,
        evenement_id: evenementId,
        statut: 'en_attente',
      })

    if (!error) router.push(`/inscription/${evenementId}/confirmation`)
  }

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Confirmez votre inscription</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <button type="submit" className="btn btn-primary">S&apos;inscrire</button>
      </form>
    </div>
  )
}
