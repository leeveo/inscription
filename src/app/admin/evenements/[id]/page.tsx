import React from 'react';

export default function EventDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Event Details for ID: {params.id}</h1>
    </div>
  );
}
