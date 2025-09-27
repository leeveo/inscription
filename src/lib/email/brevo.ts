// Service d'envoi d'emails via Brevo
// Centralise toute la logique d'envoi d'emails pour l'application

interface BrevoSender {
  name: string
  email: string
}

interface BrevoRecipient {
  email: string
  name: string
}

interface SendEmailOptions {
  to: BrevoRecipient[]
  subject: string
  htmlContent: string
  textContent?: string
  sender?: BrevoSender
  tags?: string[]
  templateId?: number
  params?: Record<string, any>
}

interface EmailTemplate {
  subject: string
  html_content: string
}

interface EmailVariables {
  event_name: string
  event_date: string
  event_location: string
  participant_firstname: string
  participant_lastname: string
  participant_email: string
  ticket_url: string
}

class BrevoEmailService {
  private apiKey: string
  private defaultSender: BrevoSender

  constructor() {
    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) {
      throw new Error('BREVO_API_KEY is not configured in environment variables')
    }
    
    this.apiKey = apiKey
    this.defaultSender = {
      name: process.env.BREVO_FROM_NAME || 'Waibooth',
      email: process.env.BREVO_FROM_EMAIL || 'waibooth.app@gmail.com'
    }
  }

  /**
   * Envoie un email via l'API Brevo
   */
  async sendEmail(options: SendEmailOptions): Promise<any> {
    const payload = {
      sender: options.sender || this.defaultSender,
      to: options.to,
      subject: options.subject,
      htmlContent: options.htmlContent,
      ...(options.textContent && { textContent: options.textContent }),
      ...(options.tags && { tags: options.tags }),
      ...(options.templateId && { templateId: options.templateId }),
      ...(options.params && { params: options.params })
    }

    console.log('📧 Envoi email via Brevo:', {
      to: options.to.map(r => r.email),
      subject: options.subject,
      sender: payload.sender.email
    })

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Erreur Brevo:', data)
      throw new Error(`Erreur Brevo: ${data.message || 'Erreur inconnue'}`)
    }

    console.log('✅ Email envoyé avec succès:', data.messageId)
    return data
  }

  /**
   * Remplace les variables dans un template d'email
   */
  processTemplate(template: EmailTemplate, variables: EmailVariables): { subject: string; htmlContent: string } {
    const variableMap = {
      '{{event_name}}': variables.event_name,
      '{{event_date}}': variables.event_date,
      '{{event_location}}': variables.event_location,
      '{{participant_firstname}}': variables.participant_firstname,
      '{{participant_lastname}}': variables.participant_lastname,
      '{{participant_email}}': variables.participant_email,
      '{{ticket_url}}': variables.ticket_url,
    }

    let subject = template.subject
    let htmlContent = template.html_content

    Object.entries(variableMap).forEach(([placeholder, value]) => {
      const regex = new RegExp(placeholder, 'g')
      subject = subject.replace(regex, value)
      htmlContent = htmlContent.replace(regex, value)
    })

    return { subject, htmlContent }
  }

  /**
   * Envoie un email de billet à un participant
   */
  async sendTicketEmail(options: {
    participant: {
      id: string
      email: string
      prenom: string
      nom: string
    }
    event: {
      id: string
      nom: string
      date_debut: string
      lieu: string
    }
    template: EmailTemplate
    ticketUrl: string
  }): Promise<any> {
    const variables: EmailVariables = {
      event_name: options.event.nom,
      event_date: new Date(options.event.date_debut).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      event_location: options.event.lieu,
      participant_firstname: options.participant.prenom,
      participant_lastname: options.participant.nom,
      participant_email: options.participant.email,
      ticket_url: options.ticketUrl
    }

    const { subject, htmlContent } = this.processTemplate(options.template, variables)

    return this.sendEmail({
      to: [{
        email: options.participant.email,
        name: `${options.participant.prenom} ${options.participant.nom}`
      }],
      subject,
      htmlContent,
      tags: ['event-ticket', `event-${options.event.id}`]
    })
  }

  /**
   * Envoie un email de notification admin
   */
  async sendAdminNotification(options: {
    to: string
    subject: string
    htmlContent: string
    eventId?: string
  }): Promise<any> {
    return this.sendEmail({
      to: [{ email: options.to, name: 'Admin' }],
      subject: options.subject,
      htmlContent: options.htmlContent,
      tags: ['admin-notification', ...(options.eventId ? [`event-${options.eventId}`] : [])]
    })
  }

  /**
   * Envoie un email de rappel d'événement
   */
  async sendEventReminder(options: {
    participants: Array<{
      email: string
      prenom: string
      nom: string
    }>
    event: {
      id: string
      nom: string
      date_debut: string
      lieu: string
    }
    reminderType: 'day-before' | 'hour-before'
  }): Promise<any[]> {
    const reminderMessages = {
      'day-before': 'N\'oubliez pas votre événement demain !',
      'hour-before': 'Votre événement commence dans 1 heure !'
    }

    const subject = `${reminderMessages[options.reminderType]} - ${options.event.nom}`
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e3a8a;">${reminderMessages[options.reminderType]}</h2>
        <h3>${options.event.nom}</h3>
        <p><strong>Date :</strong> ${new Date(options.event.date_debut).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p><strong>Lieu :</strong> ${options.event.lieu}</p>
        <p>Nous avons hâte de vous voir !</p>
      </div>
    `

    // Envoyer à tous les participants
    const promises = options.participants.map(participant => 
      this.sendEmail({
        to: [{
          email: participant.email,
          name: `${participant.prenom} ${participant.nom}`
        }],
        subject,
        htmlContent,
        tags: ['event-reminder', `event-${options.event.id}`, options.reminderType]
      })
    )

    return Promise.all(promises)
  }
}

export default BrevoEmailService