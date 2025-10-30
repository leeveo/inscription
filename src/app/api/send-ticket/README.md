# Email Sending Integration Options

This API endpoint currently simulates email sending without actually sending emails. Here are several options to implement real email sending:

## 1. Use Resend.com (Modern Email API with Next.js Support)

```bash
npm install resend
```

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In your API route
const { data, error } = await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: participant.email,
  subject: `Votre billet pour ${eventData.nom}`,
  html: `<p>Voici votre <a href="${ticketUrl}">billet</a></p>`,
});
```

## 2. Use SendGrid API (No Dependencies)

```typescript
// Using fetch with SendGrid
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: participant.email }]
    }],
    from: { email: 'your-email@example.com' },
    subject: `Votre billet pour ${eventData.nom}`,
    content: [{
      type: 'text/html',
      value: `Voici votre billet: ${ticketUrl}`
    }]
  })
});
```

## 3. Use Mailgun API (No Dependencies)

```typescript
// Using fetch with Mailgun
const response = await fetch(
  `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      from: `Event Admin <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: participant.email,
      subject: `Votre billet pour ${eventData.nom}`,
      html: `<p>Voici votre <a href="${ticketUrl}">billet</a></p>`,
    }).toString(),
  }
);
```

## 4. Use Email Service Workers (Cloudflare, Vercel)

If you're deploying on platforms like Vercel or Cloudflare, they offer specialized email sending capabilities that can be integrated without additional dependencies.

## 5. Use nodemailer (requires package installation)

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

Then update the API route to use nodemailer for sending emails.
