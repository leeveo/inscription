// Export tous les blocks et leurs configurations
export { Container } from './Container';
export { Text } from './Text';
export { Button } from './Button';
export { Hero } from './Hero';
export { EventDetails } from './EventDetails';
export { Countdown } from './Countdown';
export { Agenda } from './Agenda';
export { Speakers } from './Speakers';
export { Map } from './Map';
export { FAQ } from './FAQ';
export { Gallery } from './Gallery';
export { Footer } from './Footer';
export { RegistrationForm } from './RegistrationForm';
export {
  ConferenceFormBlock,
  WorkshopFormBlock,
  SimpleFormBlock,
  PremiumFormBlock
} from './FormBlocks';

// Configuration des settings pour Craft.js
import { Container as ContainerSettings } from './Container';
import { Text as TextSettings } from './Text';
import { Button as ButtonSettings } from './Button';
import { Hero as HeroSettings } from './Hero';
import { EventDetails as EventDetailsSettings } from './EventDetails';
import { Countdown as CountdownSettings } from './Countdown';
import { Agenda as AgendaSettings } from './Agenda';
import { Speakers as SpeakersSettings } from './Speakers';
import { Map as MapSettings } from './Map';
import { FAQ as FAQSettings } from './FAQ';
import { Gallery as GallerySettings } from './Gallery';
import { Footer as FooterSettings } from './Footer';
import { RegistrationForm as RegistrationFormSettings } from './RegistrationForm';

export const craftSettings = {
  Container: ContainerSettings.craft,
  Text: TextSettings.craft,
  Button: ButtonSettings.craft,
  Hero: HeroSettings.craft,
  EventDetails: EventDetailsSettings.craft,
  Countdown: CountdownSettings.craft,
  Agenda: AgendaSettings.craft,
  Speakers: SpeakersSettings.craft,
  Map: MapSettings.craft,
  FAQ: FAQSettings.craft,
  Gallery: GallerySettings.craft,
  Footer: FooterSettings.craft,
  RegistrationForm: RegistrationFormSettings.craft,
};