import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import puppeteer from 'puppeteer';
import { BadgeData } from '@/types/badge-templates';

interface GeneratePDFRequest {
  template: any;
  data: BadgeData;
  options: {
    format: 'A4' | 'Letter' | '85mm x 55mm' | 'credit-card';
    quality: 'low' | 'medium' | 'high';
    copies: number;
    color: boolean;
    duplex: boolean;
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    badgesPerPage: number;
  };
}

// POST - Générer un PDF de badge
export async function POST(request: NextRequest) {
  try {
    const body: GeneratePDFRequest = await request.json();
    const { template, data, options } = body;

    if (!template || !data) {
      return NextResponse.json({
        success: false,
        error: 'Template and data are required'
      }, { status: 400 });
    }

    // Générer le HTML du badge
    const badgeHTML = generateBadgeHTML(template, data, options);
    
    // Créer le PDF avec Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Configurer le format de page selon l'option
      let pageOptions: any = {
        format: 'A4',
        margin: {
          top: `${options.margins.top}mm`,
          right: `${options.margins.right}mm`,
          bottom: `${options.margins.bottom}mm`,
          left: `${options.margins.left}mm`
        }
      };

      if (options.format === '85mm x 55mm') {
        pageOptions = {
          width: '85mm',
          height: '55mm',
          margin: { top: '2mm', right: '2mm', bottom: '2mm', left: '2mm' }
        };
      } else if (options.format === 'credit-card') {
        pageOptions = {
          width: '86mm',
          height: '54mm',
          margin: { top: '2mm', right: '2mm', bottom: '2mm', left: '2mm' }
        };
      }

      await page.setContent(badgeHTML, {
        waitUntil: ['networkidle0', 'domcontentloaded']
      });

      // Générer le PDF
      const pdfBuffer = await page.pdf({
        ...pageOptions,
        printBackground: options.color,
        preferCSSPageSize: true
      });

      await browser.close();

      // Retourner le PDF
      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="badge-${data.badgeNumber}-${Date.now()}.pdf"`
        }
      });

    } catch (error) {
      await browser.close();
      throw error;
    }

  } catch (error) {
    console.error('Badge PDF generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate PDF'
    }, { status: 500 });
  }
}

function generateBadgeHTML(template: any, data: BadgeData, options: any): string {
  const zones = template.schema?.zones || template.zones || [];
  
  // Fonction pour résoudre les variables
  const resolveVariable = (content: string): string => {
    return content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const variableMap: Record<string, string> = {
        'eventName': data.eventName,
        'fullName': data.fullName,
        'firstName': data.firstName,
        'lastName': data.lastName,
        'company': data.company || '',
        'profession': data.profession || '',
        'role': data.role || '',
        'badgeNumber': data.badgeNumber,
        'participant_name': data.fullName,
        'participant_company': data.company || '',
        'participant_role': data.role || '',
        'badge_number': data.badgeNumber,
        'event_name': data.eventName,
        'qr_code': data.qrCode || ''
      };
      return variableMap[varName] || match;
    });
  };

  // Génération des zones du badge
  const zonesHTML = zones.map((zone: any) => {
    const content = zone.content?.text || zone.content?.variable || '';
    const resolvedContent = resolveVariable(content);

    const style = `
      position: absolute;
      left: ${zone.position.x}px;
      top: ${zone.position.y}px;
      width: ${zone.position.width}px;
      height: ${zone.position.height}px;
      background-color: ${zone.style?.background || 'transparent'};
      border-radius: ${zone.style?.border_radius || 0}px;
      border: ${zone.style?.border || 'none'};
      display: flex;
      align-items: center;
      justify-content: ${zone.style?.text_align === 'center' ? 'center' : 
                       zone.style?.text_align === 'right' ? 'flex-end' : 'flex-start'};
      padding: ${zone.style?.padding || 0}px;
      color: ${zone.style?.color || '#000000'};
      font-size: ${zone.style?.font_size || 12}px;
      font-family: ${zone.style?.font_family || 'Arial, sans-serif'};
      font-weight: ${zone.style?.font_weight || 'normal'};
      text-align: ${zone.style?.text_align || 'left'};
      overflow: hidden;
    `;

    if (zone.type === 'text') {
      return `<div style="${style}">${resolvedContent}</div>`;
    } else if (zone.type === 'image') {
      const imageUrl = zone.content?.image_url || '/placeholder-image.png';
      return `<div style="${style}"><img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: ${zone.style?.object_fit || 'cover'};" alt="${zone.name}" /></div>`;
    } else if (zone.type === 'qr') {
      // Pour le QR code, on utilise une API de génération ou une image placeholder
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.qrCode || data.badgeNumber)}`;
      return `<div style="${style}"><img src="${qrUrl}" style="width: 100%; height: 100%;" alt="QR Code" /></div>`;
    } else if (zone.type === 'shape') {
      return `<div style="${style}"></div>`;
    }
    return '';
  }).join('');

  // Calculer les dimensions selon le template
  const badgeWidth = template.width || 340;
  const badgeHeight = template.height || 220;
  const backgroundColor = template.background?.color || '#ffffff';
  const backgroundImage = template.background?.image || '';

  // Calculer le nombre de badges par page
  const badgesPerRow = Math.floor(options.badgesPerPage / 2) || 2;
  const badgeRows = Math.ceil(options.badgesPerPage / badgesPerRow);

  // Générer plusieurs badges si nécessaire
  const badges = Array.from({ length: options.copies }, (_, index) => `
    <div class="badge-container" style="
      position: relative;
      width: ${badgeWidth}px;
      height: ${badgeHeight}px;
      background-color: ${backgroundColor};
      ${backgroundImage ? `background-image: url(${backgroundImage});` : ''}
      background-size: cover;
      background-position: center;
      border: 1px solid #ddd;
      margin: 10px;
      page-break-inside: avoid;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    ">
      ${zonesHTML}
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Badge - ${data.fullName}</title>
    <style>
        @page {
            ${options.format === 'A4' ? 'size: A4;' : ''}
            ${options.format === 'Letter' ? 'size: Letter;' : ''}
            ${options.format === '85mm x 55mm' ? 'size: 85mm 55mm;' : ''}
            ${options.format === 'credit-card' ? 'size: 86mm 54mm;' : ''}
            margin: ${options.margins.top}mm ${options.margins.right}mm ${options.margins.bottom}mm ${options.margins.left}mm;
        }
        
        @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
            .badge-container { page-break-after: ${options.copies > 1 ? 'always' : 'auto'}; }
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: flex-start;
            gap: 20px;
        }
        
        .badges-grid {
            display: grid;
            grid-template-columns: repeat(${badgesPerRow}, 1fr);
            gap: 20px;
            max-width: 100%;
        }
    </style>
</head>
<body>
    <div class="badges-grid">
        ${badges}
    </div>
</body>
</html>`;
}