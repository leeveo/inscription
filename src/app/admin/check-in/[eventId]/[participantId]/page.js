import CheckInClient from './CheckInClient';

/**
 * Check-in page component that displays participant check-in UI
 */
export default function CheckInPage(props) {
  // Extract params safely
  const { eventId, participantId } = props.params || {};
  
  return (
    <CheckInClient 
      eventId={eventId} 
      participantId={participantId} 
    />
  );
}

/**
 * Generate page metadata based on eventId and participantId
 */
export async function generateMetadata(props) {
  const { eventId, participantId } = props.params || {};
  
  return {
    title: `Check-in Participant ${participantId} for Event ${eventId}`,
  };
}
