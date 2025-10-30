import CheckInClient from './CheckInClient';

interface CheckInPageProps {
  params: {
    eventId: string;
    participantId: string;
  };
}

export default function CheckInPage({ params }: CheckInPageProps) {
  const { eventId, participantId } = params;

  return (
    <CheckInClient 
      eventId={eventId} 
      participantId={participantId} 
    />
  );
}

export async function generateMetadata({ params }: CheckInPageProps) {
  const { eventId, participantId } = params;

  return {
    title: `Check-in Participant ${participantId} for Event ${eventId}`,
  };
}
