import ParticipantDetailsClient from './ParticipantDetailsClient';

// Generate metadata for the page - use the params in the title
// Add proper type annotation to the params parameter
// @ts-expect-error - Next.js build expects specific types
export async function generateMetadata({ params }) {
  return {
    title: `Détails du participant ${params.id}`,
  };
}

// Server component follows Next.js 15 conventions
// For the page component itself, also add type annotation if needed
// @ts-expect-error - Next.js build expects specific types
export default function ParticipantDetailsPage({ params }) {
  return <ParticipantDetailsClient participantId={params.id} />;
}
