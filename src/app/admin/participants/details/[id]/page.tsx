import ParticipantDetailsClient from './ParticipantDetailsClient';

// Generate metadata for the page - use the params in the title
export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Détails du participant ${params.id}`,
  };
}

// Server component follows Next.js 15 conventions
// For the page component itself, also add type annotation if needed
export default function ParticipantDetailsPage({ params }: { params: { id: string } }) {
  return <ParticipantDetailsClient participantId={params.id} />;
}
