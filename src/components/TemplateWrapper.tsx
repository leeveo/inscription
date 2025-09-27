'use client'

import React from 'react';

interface TemplateWrapperProps {
  templateId: string;
  customization?: any;
  children: React.ReactNode;
  className?: string;
}

export default function TemplateWrapper({ 
  templateId, 
  customization = {}, 
  children,
  className = '' 
}: TemplateWrapperProps) {
  
  // Générer les classes CSS selon le template
  const getTemplateClasses = (): string => {
    let classes = className;
    
    switch (templateId) {
      case 'modern-gradient':
        classes += ' template-modern-gradient bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 min-h-screen';
        break;
      case 'classic-business':
        classes += ' template-classic-business bg-gray-50 min-h-screen';
        break;
      case 'minimal-clean':
        classes += ' template-minimal-clean bg-white min-h-screen';
        break;
      case 'creative-event':
        classes += ' template-creative-event bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 min-h-screen';
        break;
      case 'conference-pro':
        classes += ' template-conference-pro bg-slate-900 text-white min-h-screen';
        break;
      case 'tech-startup':
        classes += ' template-tech-startup bg-gradient-to-br from-gray-900 to-blue-900 text-white min-h-screen';
        break;
      case 'elegant-gala':
        classes += ' template-elegant-gala bg-gradient-to-b from-gray-800 to-black text-white min-h-screen';
        break;
      case 'festival-fun':
        classes += ' template-festival-fun bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 min-h-screen';
        break;
      case 'workshop-learning':
        classes += ' template-workshop-learning bg-gradient-to-b from-green-100 to-blue-100 min-h-screen';
        break;
      default:
        classes += ' template-default bg-white min-h-screen';
    }
    
    return classes;
  };

  // Générer les styles CSS personnalisés
  const customStyles = React.useMemo(() => {
    const primaryColor = customization.primaryColor || '#3B82F6';
    const secondaryColor = customization.secondaryColor || '#1F2937';
    const backgroundColor = customization.backgroundColor || '#FFFFFF';
    const fontFamily = customization.fontFamily || 'Inter';

    return `
      .template-${templateId} {
        --primary-color: ${primaryColor};
        --secondary-color: ${secondaryColor};
        --bg-color: ${backgroundColor};
        --font-family: ${fontFamily};
        font-family: var(--font-family), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .template-modern-gradient .form-container {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
      }
      .template-modern-gradient .btn-primary {
        background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
        border: none;
        border-radius: 12px;
        transition: all 0.3s ease;
        transform: translateY(0);
        color: white;
      }
      .template-modern-gradient .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      }
      
      .template-classic-business {
        font-family: 'Georgia', serif;
      }
      .template-classic-business .form-container {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
      }
      .template-classic-business .btn-primary {
        background-color: ${primaryColor};
        border-radius: 6px;
        font-weight: 600;
        color: white;
        border: none;
      }
      
      .template-minimal-clean {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .template-minimal-clean .form-container {
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        border: 1px solid #f3f4f6;
      }
      .template-minimal-clean .btn-primary {
        background-color: #000000;
        border-radius: 4px;
        font-weight: 500;
        color: white;
        border: none;
      }
      
      .template-creative-event {
        font-family: 'Poppins', sans-serif;
      }
      .template-creative-event .form-container {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(15px);
        border-radius: 25px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.3);
      }
      .template-creative-event .btn-primary {
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24);
        background-size: 300% 300%;
        animation: gradientShift 3s ease infinite;
        border: none;
        border-radius: 50px;
        font-weight: bold;
        color: white;
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .template-conference-pro {
        font-family: 'Roboto', sans-serif;
      }
      .template-conference-pro .form-container {
        background: rgba(30, 41, 59, 0.95);
        border-radius: 12px;
        border: 1px solid #475569;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      .template-conference-pro .btn-primary {
        background: linear-gradient(135deg, #0EA5E9, #3B82F6);
        border-radius: 8px;
        font-weight: 600;
        color: white;
        border: none;
      }
      
      .template-tech-startup {
        font-family: 'Montserrat', sans-serif;
      }
      .template-tech-startup .form-container {
        background: rgba(15, 23, 42, 0.9);
        border-radius: 16px;
        border: 1px solid #1e293b;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
      }
      .template-tech-startup .btn-primary {
        background: linear-gradient(135deg, #00d2ff, #3a7bd5);
        border-radius: 12px;
        font-weight: 700;
        color: white;
        border: none;
      }
      
      .template-elegant-gala {
        font-family: 'Playfair Display', serif;
      }
      .template-elegant-gala .form-container {
        background: rgba(17, 24, 39, 0.95);
        border-radius: 8px;
        border: 2px solid #d4af37;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      }
      .template-elegant-gala .btn-primary {
        background: linear-gradient(135deg, #d4af37, #ffd700);
        color: #000;
        border-radius: 6px;
        font-weight: 600;
        border: none;
      }
      
      .template-festival-fun {
        font-family: 'Fredoka One', cursive;
      }
      .template-festival-fun .form-container {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 30px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
        border: 3px solid #fff;
      }
      .template-festival-fun .btn-primary {
        background: linear-gradient(45deg, #ff9a9e, #fecfef, #fecfef);
        border-radius: 50px;
        font-weight: bold;
        border: 3px solid #fff;
        color: #333;
      }
      
      .template-workshop-learning {
        font-family: 'Inter', sans-serif;
      }
      .template-workshop-learning .form-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(34, 197, 94, 0.1);
        border: 1px solid #d1fae5;
      }
      .template-workshop-learning .btn-primary {
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 8px;
        font-weight: 600;
        color: white;
        border: none;
      }

      /* Styles pour les inputs dans tous les templates */
      .template-${templateId} input[type="text"],
      .template-${templateId} input[type="email"],
      .template-${templateId} input[type="tel"],
      .template-${templateId} textarea,
      .template-${templateId} select {
        transition: all 0.2s ease;
      }
      
      .template-${templateId} input[type="text"]:focus,
      .template-${templateId} input[type="email"]:focus,
      .template-${templateId} input[type="tel"]:focus,
      .template-${templateId} textarea:focus,
      .template-${templateId} select:focus {
        border-color: ${primaryColor};
        box-shadow: 0 0 0 3px ${primaryColor}20;
      }

      ${customization.customCSS || ''}
    `;
  }, [templateId, customization]);

  // Injecter les styles CSS
  React.useEffect(() => {
    const styleId = `template-styles-${templateId}`;
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.innerHTML = customStyles;
    
    return () => {
      // Cleanup quand le composant se démonte
      const style = document.getElementById(styleId);
      if (style) {
        document.head.removeChild(style);
      }
    };
  }, [customStyles, templateId]);

  return (
    <div className={getTemplateClasses()}>
      {children}
    </div>
  );
}