// src/components/qr/QrCodeCard.tsx
'use client'

import QRCode from 'react-qr-code'

type Props = {
  value: string
}

export default function QrCodeCard({ value }: Props) {
  return (
    <div className="flex justify-center p-4 bg-white rounded-md shadow">
      <QRCode value={value} size={160} />
    </div>
  )
}
