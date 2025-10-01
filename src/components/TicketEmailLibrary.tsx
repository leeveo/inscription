'use client'

import { useState } from 'react'

export type TicketEmailTemplate = {
  id: string
  name: string
  description: string
  thumbnail: string
  subject: string
  htmlContent: string
  category: 'business' | 'modern' | 'creative' | 'minimal'
  isPrintable: boolean
}

export const ticketEmailTemplates: TicketEmailTemplate[] = [
  // Template 1: Modern Gradient Badge
  {
    id: 'modern-gradient',
    name: 'Modern Gradient',
    description: 'Badge horizontal moderne avec dégradé violet - Format paysage imprimable',
    thumbnail: '/templates/modern-gradient.png',
    category: 'modern',
    isPrintable: true,
    subject: '🎟️ Votre ticket pour {{event_name}} - {{participant_firstname}}',
    htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre Ticket</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .ticket-badge { page-break-after: always; width: 100%; height: 100vh; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f7fa;
    }
  </style>
</head>
<body style="padding: 20px;">
  <!-- Badge Horizontal Format -->
  <div class="ticket-badge" style="max-width: 900px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.2); display: flex; height: 400px;">

    <!-- Left Section: Event Info -->
    <div style="flex: 2; padding: 40px; color: white; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <h1 style="font-size: 42px; font-weight: 900; margin-bottom: 15px; letter-spacing: -1px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
          {{event_name}}
        </h1>
        <div style="font-size: 18px; margin-top: 20px;">
          <div style="background: rgba(255,255,255,0.25); display: inline-block; padding: 10px 20px; border-radius: 25px; margin: 5px 5px 5px 0; backdrop-filter: blur(10px);">
            📅 {{event_date}}
          </div>
          <div style="background: rgba(255,255,255,0.25); display: inline-block; padding: 10px 20px; border-radius: 25px; margin: 5px; backdrop-filter: blur(10px);">
            📍 {{event_location}}
          </div>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px);">
        <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 10px;">
          {{participant_firstname}} {{participant_lastname}}
        </h2>
        <p style="font-size: 16px; opacity: 0.95;">{{participant_profession}}</p>
        <p style="font-size: 14px; opacity: 0.9; margin-top: 5px;">{{participant_email}}</p>
      </div>
    </div>

    <!-- Right Section: QR Code -->
    <div style="flex: 1; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px;">
      <div style="text-align: center;">
        {{qr_code}}
        <p style="margin-top: 20px; font-size: 16px; color: #667eea; font-weight: 700;">
          🎫 SCAN POUR CHECK-IN
        </p>
        <p style="margin-top: 10px; font-size: 12px; color: #6b7280;">
          Présentez ce QR code à l'entrée
        </p>
      </div>

      <div style="margin-top: 30px; padding: 15px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 8px; width: 100%;">
        <p style="font-size: 12px; color: #065f46; font-weight: 600; text-align: center;">
          ✅ {{participant_sessions}}
        </p>
      </div>
    </div>
  </div>

  <!-- Email Content (no-print for badge) -->
  <div class="no-print" style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
    <h2 style="color: #667eea; font-size: 24px; margin-bottom: 15px;">
      Bonjour {{participant_firstname}} 👋
    </h2>
    <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
      Votre inscription à <strong>{{event_name}}</strong> est confirmée ! Imprimez votre badge ci-dessus ou présentez-le sur votre téléphone.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ticket_url}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">
        🎟️ Voir mon ticket complet
      </a>
    </div>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 30px;">
      <p style="color: #92400e; font-size: 14px;">
        <strong>⚠️ Important:</strong> Arrivez 15 minutes avant le début de l'événement.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  },

  // Template 2: Business Professional
  {
    id: 'business-professional',
    name: 'Business Professional',
    description: 'Badge vertical élégant format business - Style corporate',
    thumbnail: '/templates/business-professional.png',
    category: 'business',
    isPrintable: true,
    subject: 'Votre badge professionnel - {{event_name}}',
    htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4 portrait; margin: 0; }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .ticket-badge { page-break-after: always; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; background: #f0f2f5; }
  </style>
</head>
<body style="padding: 20px;">
  <!-- Badge Vertical Format -->
  <div class="ticket-badge" style="max-width: 420px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); border: 3px solid #2c3e50;">

    <!-- Header Corporate -->
    <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); padding: 30px 25px; text-align: center;">
      <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.2);">
        <span style="font-size: 40px;">🎯</span>
      </div>
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 10px;">
        {{event_name}}
      </h1>
      <p style="color: #bdc3c7; font-size: 14px;">
        📅 {{event_date}} • 📍 {{event_location}}
      </p>
    </div>

    <!-- Participant Info -->
    <div style="padding: 35px 25px; text-align: center; border-bottom: 2px dashed #e0e0e0;">
      <div style="background: #ecf0f1; width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 4px solid #3498db;">
        <span style="font-size: 56px; font-weight: 900; color: #2c3e50;">
          {{participant_firstname|first}}{{participant_lastname|first}}
        </span>
      </div>
      <h2 style="color: #2c3e50; font-size: 26px; font-weight: 800; margin-bottom: 8px;">
        {{participant_firstname}} {{participant_lastname}}
      </h2>
      <p style="color: #7f8c8d; font-size: 16px; font-weight: 600; margin-bottom: 5px;">
        {{participant_profession}}
      </p>
      <p style="color: #95a5a6; font-size: 13px;">
        {{participant_email}}
      </p>
    </div>

    <!-- QR Code Section -->
    <div style="padding: 30px 25px; text-align: center; background: #f8f9fa;">
      <div style="background: white; padding: 20px; border-radius: 12px; display: inline-block; border: 2px solid #e0e0e0;">
        {{qr_code}}
      </div>
      <p style="margin-top: 15px; font-size: 14px; color: #2c3e50; font-weight: 700;">
        ACCESS BADGE
      </p>
      <p style="font-size: 11px; color: #7f8c8d; margin-top: 5px;">
        Scan this code at the entrance
      </p>
    </div>

    <!-- Sessions -->
    <div style="padding: 20px 25px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
      <p style="font-size: 12px; color: #2e7d32; font-weight: 600; text-align: center;">
        {{participant_sessions}}
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 15px; background: #2c3e50; text-align: center;">
      <p style="color: #bdc3c7; font-size: 10px;">© {{event_name}} - All rights reserved</p>
    </div>
  </div>

  <!-- Email Content -->
  <div class="no-print" style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; padding: 40px;">
    <h2 style="color: #2c3e50; font-size: 24px; margin-bottom: 15px;">
      Bonjour {{participant_firstname}},
    </h2>
    <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
      Votre badge professionnel pour <strong>{{event_name}}</strong> est prêt. Imprimez-le ou présentez-le sur votre appareil mobile.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ticket_url}}" style="display: inline-block; background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 700;">
        Voir mon badge complet
      </a>
    </div>
  </div>
</body>
</html>
    `.trim()
  },

  // Template 3: Creative Festival
  {
    id: 'creative-festival',
    name: 'Creative Festival',
    description: 'Ticket coloré et festif - Parfait pour événements créatifs et culturels',
    thumbnail: '/templates/creative-festival.png',
    category: 'creative',
    isPrintable: true,
    subject: '🎨 Votre pass créatif pour {{event_name}}!',
    htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4 landscape; margin: 0; }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .ticket-badge { page-break-after: always; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Comic Sans MS', 'Arial Rounded MT Bold', sans-serif; background: #fff; }
  </style>
</head>
<body style="padding: 20px;">
  <!-- Ticket Horizontal Colorful -->
  <div class="ticket-badge" style="max-width: 950px; margin: 0 auto; background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f7b731, #5f27cd); border-radius: 24px; padding: 6px; box-shadow: 0 25px 70px rgba(0,0,0,0.25);">
    <div style="background: white; border-radius: 20px; display: flex; overflow: hidden; height: 420px;">

      <!-- Left Colorful Section -->
      <div style="flex: 1.5; background: linear-gradient(135deg, #ff6b6b 0%, #f7b731 50%, #4ecdc4 100%); padding: 40px; color: white; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
        <div style="position: absolute; bottom: -80px; left: -80px; width: 250px; height: 250px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>

        <div style="position: relative; z-index: 1;">
          <div style="font-size: 48px; margin-bottom: 15px;">🎨</div>
          <h1 style="font-size: 46px; font-weight: 900; margin-bottom: 15px; text-shadow: 3px 3px 6px rgba(0,0,0,0.2); line-height: 1.1;">
            {{event_name}}
          </h1>
          <div style="font-size: 18px; margin-top: 20px;">
            <div style="background: rgba(255,255,255,0.3); display: inline-block; padding: 12px 24px; border-radius: 30px; margin: 5px 5px 5px 0; backdrop-filter: blur(10px); font-weight: 700;">
              📅 {{event_date}}
            </div>
            <div style="background: rgba(255,255,255,0.3); display: inline-block; padding: 12px 24px; border-radius: 30px; margin: 5px; backdrop-filter: blur(10px); font-weight: 700;">
              📍 {{event_location}}
            </div>
          </div>
        </div>

        <div style="position: relative; z-index: 1;">
          <div style="background: rgba(255,255,255,0.3); padding: 25px; border-radius: 16px; backdrop-filter: blur(15px); border: 2px solid rgba(255,255,255,0.5);">
            <p style="font-size: 14px; opacity: 0.95; margin-bottom: 8px; font-weight: 600;">PASS CRÉATIF</p>
            <h2 style="font-size: 32px; font-weight: 900; margin-bottom: 8px; text-transform: uppercase;">
              {{participant_firstname}} {{participant_lastname}}
            </h2>
            <p style="font-size: 16px; opacity: 0.95; font-weight: 600;">{{participant_profession}}</p>
          </div>
        </div>
      </div>

      <!-- Right White Section -->
      <div style="flex: 1; background: white; padding: 40px 30px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="text-align: center;">
          <div style="background: linear-gradient(135deg, #ff6b6b, #4ecdc4); padding: 25px; border-radius: 20px; display: inline-block; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
            {{qr_code}}
          </div>
          <p style="margin-top: 25px; font-size: 20px; color: #ff6b6b; font-weight: 900;">
            🎫 SCAN ME!
          </p>
          <p style="margin-top: 10px; font-size: 13px; color: #666; font-weight: 600;">
            Présentez ce code à l'entrée
          </p>
        </div>

        <div style="margin-top: 35px; width: 100%;">
          <div style="background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #ff6b6b;">
            <p style="font-size: 12px; color: #d63031; font-weight: 700; text-align: center;">
              ✨ SESSIONS ✨
            </p>
            <p style="font-size: 11px; color: #e17055; margin-top: 8px; text-align: center;">
              {{participant_sessions}}
            </p>
          </div>
        </div>

        <div style="margin-top: 25px; text-align: center;">
          <p style="font-size: 11px; color: #999;">{{participant_email}}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Email Content -->
  <div class="no-print" style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
    <h2 style="background: linear-gradient(135deg, #ff6b6b, #4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin-bottom: 15px; font-weight: 900;">
      Hey {{participant_firstname}}! 🎨
    </h2>
    <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
      Ton pass créatif pour <strong>{{event_name}}</strong> est prêt! Imprime-le ou garde-le sur ton téléphone. On a hâte de te voir!
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ticket_url}}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b, #4ecdc4); color: white; padding: 18px 45px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 16px; box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);">
        🎟️ Voir mon pass
      </a>
    </div>
  </div>
</body>
</html>
    `.trim()
  },

  // Template 4: Minimal Clean
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Design épuré et minimaliste - Format badge simple et élégant',
    thumbnail: '/templates/minimal-clean.png',
    category: 'minimal',
    isPrintable: true,
    subject: 'Ticket {{event_name}} - {{participant_firstname}} {{participant_lastname}}',
    htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A5 portrait; margin: 0; }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .ticket-badge { page-break-after: always; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fafafa; }
  </style>
</head>
<body style="padding: 20px;">
  <!-- Badge Minimal Format -->
  <div class="ticket-badge" style="max-width: 380px; margin: 0 auto; background: white; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.08); border: 1px solid #e0e0e0;">

    <!-- Header Minimal -->
    <div style="padding: 40px 30px 30px; border-bottom: 1px solid #e0e0e0;">
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="width: 60px; height: 4px; background: #000; margin: 0 auto;"></div>
      </div>
      <h1 style="color: #000; font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 15px; letter-spacing: -0.5px;">
        {{event_name}}
      </h1>
      <div style="text-align: center; color: #666; font-size: 14px; font-weight: 500;">
        <div style="margin: 5px 0;">{{event_date}}</div>
        <div style="margin: 5px 0;">{{event_location}}</div>
      </div>
    </div>

    <!-- Participant Section -->
    <div style="padding: 35px 30px; border-bottom: 1px solid #e0e0e0;">
      <div style="text-align: center;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: #f5f5f5; border: 2px solid #000; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px; font-weight: 900; color: #000;">
            {{participant_firstname|first}}{{participant_lastname|first}}
          </span>
        </div>
        <h2 style="color: #000; font-size: 24px; font-weight: 700; margin-bottom: 8px;">
          {{participant_firstname}} {{participant_lastname}}
        </h2>
        <p style="color: #666; font-size: 14px; font-weight: 500; margin-bottom: 5px;">
          {{participant_profession}}
        </p>
        <p style="color: #999; font-size: 12px;">
          {{participant_email}}
        </p>
      </div>
    </div>

    <!-- QR Code -->
    <div style="padding: 35px 30px; text-align: center;">
      <div style="border: 2px solid #000; padding: 20px; border-radius: 4px; display: inline-block;">
        {{qr_code}}
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #000; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
        Access Code
      </p>
    </div>

    <!-- Sessions -->
    <div style="padding: 20px 30px; background: #f5f5f5; border-top: 1px solid #e0e0e0;">
      <p style="font-size: 11px; color: #666; text-align: center; font-weight: 500;">
        {{participant_sessions}}
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 15px 30px; border-top: 1px solid #e0e0e0; text-align: center;">
      <p style="color: #999; font-size: 10px; font-weight: 500;">
        TICKET #{{participant_email|hash}}
      </p>
    </div>
  </div>

  <!-- Email Content -->
  <div class="no-print" style="max-width: 600px; margin: 40px auto; background: white; border-radius: 4px; padding: 40px; border: 1px solid #e0e0e0;">
    <h2 style="color: #000; font-size: 24px; margin-bottom: 15px; font-weight: 700;">
      Bonjour {{participant_firstname}},
    </h2>
    <p style="color: #666; font-size: 16px; margin-bottom: 20px; line-height: 1.6;">
      Votre ticket pour {{event_name}} est disponible. Imprimez-le ou présentez-le depuis votre appareil.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ticket_url}}" style="display: inline-block; background: #000; color: white; padding: 14px 35px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase;">
        Voir mon ticket
      </a>
    </div>
  </div>
</body>
</html>
    `.trim()
  },

  // Template 5: VIP Premium
  {
    id: 'vip-premium',
    name: 'VIP Premium',
    description: 'Badge premium luxe avec finitions dorées - Pour événements haut de gamme',
    thumbnail: '/templates/vip-premium.png',
    category: 'business',
    isPrintable: true,
    subject: '👑 Votre accès VIP - {{event_name}}',
    htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4 portrait; margin: 0; }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .ticket-badge { page-break-after: always; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', 'Times New Roman', serif; background: #1a1a1a; }
  </style>
</head>
<body style="padding: 20px;">
  <!-- VIP Badge Premium -->
  <div class="ticket-badge" style="max-width: 450px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.5); border: 3px solid #d4af37;">

    <!-- VIP Header -->
    <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e4a7 50%, #d4af37 100%); padding: 8px; text-align: center;">
      <p style="color: #1a1a1a; font-size: 14px; font-weight: 900; letter-spacing: 3px;">EXCLUSIVE ACCESS</p>
    </div>

    <div style="padding: 40px 30px 30px; background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%); position: relative;">
      <!-- Gold Accents -->
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #d4af37, transparent);"></div>

      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #d4af37, #f4e4a7); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4); margin-bottom: 20px; border: 3px solid #f4e4a7;">
          <span style="font-size: 45px;">👑</span>
        </div>
        <h1 style="color: #d4af37; font-size: 32px; font-weight: 700; margin-bottom: 12px; letter-spacing: 1px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
          {{event_name}}
        </h1>
        <div style="color: #a0a0a0; font-size: 14px; font-weight: 500; letter-spacing: 0.5px;">
          <div style="margin: 8px 0;">{{event_date}}</div>
          <div style="margin: 8px 0;">{{event_location}}</div>
        </div>
      </div>

      <!-- VIP Badge -->
      <div style="background: linear-gradient(135deg, #2d2d2d, #1a1a1a); padding: 30px 25px; border-radius: 12px; border: 2px solid #d4af37; margin: 25px 0; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; right: 0; background: #d4af37; color: #1a1a1a; padding: 5px 15px; font-size: 10px; font-weight: 900; letter-spacing: 1px; transform: rotate(0deg);">
          VIP
        </div>

        <div style="text-align: center;">
          <div style="border: 3px solid #d4af37; border-radius: 50%; width: 110px; height: 110px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #d4af37, #f4e4a7); box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);">
            <span style="font-size: 48px; font-weight: 900; color: #1a1a1a;">
              {{participant_firstname|first}}{{participant_lastname|first}}
            </span>
          </div>
          <h2 style="color: #d4af37; font-size: 28px; font-weight: 700; margin-bottom: 10px; letter-spacing: 0.5px;">
            {{participant_firstname}} {{participant_lastname}}
          </h2>
          <p style="color: #f4e4a7; font-size: 15px; font-weight: 600; margin-bottom: 8px; letter-spacing: 0.5px;">
            {{participant_profession}}
          </p>
          <p style="color: #808080; font-size: 12px; font-style: italic;">
            {{participant_email}}
          </p>
        </div>
      </div>
    </div>

    <!-- QR Code Section -->
    <div style="padding: 35px 30px; background: #1a1a1a; text-align: center; border-top: 2px solid #d4af37;">
      <div style="background: white; padding: 25px; border-radius: 12px; display: inline-block; border: 3px solid #d4af37; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);">
        {{qr_code}}
      </div>
      <p style="margin-top: 20px; font-size: 14px; color: #d4af37; font-weight: 700; letter-spacing: 2px;">
        EXCLUSIVE ENTRY CODE
      </p>
      <p style="margin-top: 8px; font-size: 11px; color: #808080; font-style: italic;">
        Premium Access • Fast Track Entry
      </p>
    </div>

    <!-- Sessions VIP -->
    <div style="padding: 25px 30px; background: linear-gradient(135deg, #2d2d2d, #1a1a1a); border-top: 1px solid #d4af37;">
      <p style="font-size: 11px; color: #d4af37; font-weight: 600; text-align: center; letter-spacing: 1px;">
        ✨ {{participant_sessions}} ✨
      </p>
    </div>

    <!-- Premium Footer -->
    <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e4a7 50%, #d4af37 100%); padding: 12px; text-align: center;">
      <p style="color: #1a1a1a; font-size: 11px; font-weight: 900; letter-spacing: 2px;">PREMIUM EXPERIENCE</p>
    </div>
  </div>

  <!-- Email Content -->
  <div class="no-print" style="max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a1a, #2d2d2d); border-radius: 12px; padding: 40px; border: 2px solid #d4af37; box-shadow: 0 20px 60px rgba(0,0,0,0.4);">
    <h2 style="color: #d4af37; font-size: 28px; margin-bottom: 15px; font-weight: 700;">
      Cher(e) {{participant_firstname}},
    </h2>
    <p style="color: #e0e0e0; font-size: 16px; margin-bottom: 20px; line-height: 1.8;">
      Nous sommes honorés de vous accueillir en tant qu'invité(e) VIP à <strong style="color: #d4af37;">{{event_name}}</strong>. Votre accès premium est confirmé.
    </p>
    <div style="text-align: center; margin: 35px 0;">
      <a href="{{ticket_url}}" style="display: inline-block; background: linear-gradient(135deg, #d4af37, #f4e4a7); color: #1a1a1a; padding: 18px 45px; text-decoration: none; border-radius: 8px; font-weight: 900; font-size: 16px; letter-spacing: 1px; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4); text-transform: uppercase;">
        👑 Mon Accès VIP
      </a>
    </div>
    <div style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 20px; border-radius: 8px; margin-top: 30px;">
      <p style="color: #f4e4a7; font-size: 13px; line-height: 1.6;">
        <strong>🌟 Avantages VIP:</strong> Accès prioritaire • Espace lounge exclusif • Service premium
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }
]

type TicketEmailLibraryProps = {
  onSelectTemplate: (template: TicketEmailTemplate) => void
  onClose: () => void
}

export default function TicketEmailLibrary({ onSelectTemplate, onClose }: TicketEmailLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: 'Tous', icon: '📚' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'modern', name: 'Moderne', icon: '✨' },
    { id: 'creative', name: 'Créatif', icon: '🎨' },
    { id: 'minimal', name: 'Minimal', icon: '⚡' }
  ]

  const filteredTemplates = ticketEmailTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 bg-opacity-95 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200">

        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                📧 Bibliothèque de Templates Email
              </h2>
              <p className="text-blue-100 text-sm font-medium">
                Choisissez parmi {ticketEmailTemplates.length} templates professionnels imprimables
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 transition-all rounded-full p-2 w-10 h-10 flex items-center justify-center font-bold text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div className="mb-5">
            <input
              type="text"
              placeholder="🔍 Rechercher un template..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 bg-white bg-opacity-20 backdrop-blur-lg border border-white border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-white placeholder-blue-100 font-medium"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-3 flex-wrap">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-white text-purple-600 shadow-xl'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 backdrop-blur-lg'
                }`}
              >
                <span className="mr-2 text-lg">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50 to-blue-50">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl font-semibold">Aucun template trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-blue-400 transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
                >
                  {/* Preview */}
                  <div className="h-56 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className="text-7xl transform group-hover:scale-110 transition-transform duration-300">
                      {getCategoryIcon(template.category)}
                    </div>
                    {template.isPrintable && (
                      <span className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                        🖨️ Imprimable
                      </span>
                    )}
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                      {getCategoryLabel(template.category)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="font-black text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>

                    {/* Action Button */}
                    <button
                      onClick={() => onSelectTemplate(template)}
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:shadow-xl transition-all font-bold transform group-hover:scale-105"
                    >
                      ✨ Utiliser ce template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <p className="text-sm text-gray-700 text-center font-medium">
            💡 Tous les templates sont <strong>personnalisables</strong>, <strong>imprimables</strong> et incluent automatiquement les informations de l'événement et du participant avec QR code
          </p>
        </div>

      </div>
    </div>
  )
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    business: '💼',
    modern: '✨',
    creative: '🎨',
    minimal: '⚡'
  }
  return icons[category] || '📧'
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    business: 'Business',
    modern: 'Moderne',
    creative: 'Créatif',
    minimal: 'Minimal'
  }
  return labels[category] || 'Template'
}
