'use client'

import React from 'react';
import { FiZap, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function WizardEventPage() {
  const wizardTypes = [
    {
      id: 'salon-professionnel',
      title: 'Salon professionnel checkin',
      description: 'Optimisé pour les salons avec système de check-in avancé, gestion des exposants et visiteurs',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: 'from-slate-900 via-blue-900 to-indigo-900',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      hoverColor: 'group-hover:text-blue-600',
      tags: ['Check-in QR', 'Exposants', 'Badges', 'Analytics'],
      tagColors: ['bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700', 'bg-cyan-100 text-cyan-700'],
      href: '/admin/wizard-salon'
    },
    {
      id: 'conference',
      title: 'Conférence, session et séminaire',
      description: 'Parfait pour conférences, formations, ateliers et séminaires avec gestion complète des sessions, intervenants et participants',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200 hover:border-purple-400',
      hoverColor: 'group-hover:text-purple-600',
      tags: ['Sessions', 'Intervenants', 'Agenda', 'Networking'],
      tagColors: ['bg-purple-100 text-purple-700', 'bg-violet-100 text-violet-700', 'bg-indigo-100 text-indigo-700', 'bg-pink-100 text-pink-700'],
      href: '/admin/wizard-conference'
    },
    {
      id: 'concert-payant',
      title: 'Concert payant',
      description: 'Spécialisé pour événements musicaux avec billetterie, différents tarifs et gestion des places',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200 hover:border-orange-400',
      hoverColor: 'group-hover:text-orange-600',
      tags: ['Billetterie', 'Paiements', 'Artistes', 'Sponsors'],
      tagColors: ['bg-orange-100 text-orange-700', 'bg-red-100 text-red-700', 'bg-pink-100 text-pink-700'],
      href: '/admin/wizard-concert'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center shadow-lg border border-blue-400/30 backdrop-blur-sm">
              <FiZap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Wizard Event
              </h1>
              <p className="text-gray-600 text-lg font-medium">
                Choisissez le type d'événement que vous souhaitez créer
              </p>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Chaque wizard est optimisé avec des fonctionnalités spécifiques pour votre type d'événement.
              Sélectionnez celui qui correspond le mieux à votre projet.
            </p>
          </div>
        </div>

        {/* Wizard Type Selection Cards */}
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {wizardTypes.map((wizard) => (
            <Link key={wizard.id} href={wizard.href}>
              <div className={`group cursor-pointer bg-gradient-to-br ${wizard.bgGradient} rounded-3xl p-8 border-2 ${wizard.borderColor} transition-all duration-300 transform hover:scale-105 hover:shadow-2xl relative h-full`}>
                <div className="flex flex-col items-center text-center h-full">
                  {/* Icon */}
                  <div className={`w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${wizard.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    {wizard.icon}
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl font-bold text-gray-900 mb-4 transition-colors ${wizard.hoverColor}`}>
                    {wizard.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-base mb-6 leading-relaxed">
                    {wizard.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {wizard.tags.map((tag, index) => (
                      <span key={tag} className={`px-3 py-1 ${wizard.tagColors[index]} text-xs rounded-full font-medium`}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Arrow */}
                  <div className={`mt-auto transition-all duration-300 ${wizard.hoverColor}`}>
                    <FiArrowRight className="w-6 h-6 mx-auto group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comment choisir le bon wizard ?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Salon professionnel</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Idéal pour les événements B2B, foires commerciales, et expositions avec gestion des exposants et système de check-in.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Conférence</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Parfait pour les formations, séminaires, ateliers et événements académiques avec gestion des sessions et intervenants.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Concert</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Spécialisé pour les événements musicaux, festivals et spectacles avec billetterie complète et gestion des artistes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}