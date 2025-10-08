'use client'

import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import type { CountdownBlockProps } from '@/types/builder';

export const Countdown = ({
  targetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  title = 'L\'événement commence dans',
  description = 'Ne manquez pas cette opportunité unique !',
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
}: CountdownBlockProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white rounded-lg shadow-lg p-4 min-w-[80px] mb-2">
        <div className="text-4xl md:text-5xl font-bold text-gray-900">
          {value.toString().padStart(2, '0')}
        </div>
      </div>
      <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );

  return (
    <div
      ref={(ref: HTMLDivElement | null) => { if (ref) connect(drag(ref)) }}
      className="relative w-full py-12 px-8 bg-gradient-to-br from-blue-50 to-indigo-100"
      style={{
        border: selected || hovered ? '2px solid #3B82F6' : '2px solid transparent',
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-blue-600 text-white text-xs font-medium">
          Compte à rebours {selected && '• Sélectionné'}
        </div>
      )}

      <div className="max-w-4xl mx-auto text-center">
        {/* Title */}
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
        )}

        {/* Description */}
        {description && (
          <p className="text-lg text-gray-700 mb-8">
            {description}
          </p>
        )}

        {/* Countdown Display */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {showDays && <TimeUnit value={timeLeft.days} label="Jours" />}
          {showHours && <TimeUnit value={timeLeft.hours} label="Heures" />}
          {showMinutes && <TimeUnit value={timeLeft.minutes} label="Minutes" />}
          {showSeconds && <TimeUnit value={timeLeft.seconds} label="Secondes" />}
        </div>
      </div>
    </div>
  );
};

// Settings component
export const CountdownSettings = () => {
  const {
    actions: { setProp },
    targetDate,
    title,
    description,
    showDays,
    showHours,
    showMinutes,
    showSeconds,
  } = useNode((node) => ({
    targetDate: node.data.props.targetDate,
    title: node.data.props.title,
    description: node.data.props.description,
    showDays: node.data.props.showDays,
    showHours: node.data.props.showHours,
    showMinutes: node.data.props.showMinutes,
    showSeconds: node.data.props.showSeconds,
  }));

  return (
    <div className="space-y-4">
      {/* Content */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contenu</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date cible
            </label>
            <input
              type="datetime-local"
              value={targetDate ? new Date(targetDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => setProp((props: CountdownBlockProps) => (props.targetDate = new Date(e.target.value).toISOString()))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setProp((props: CountdownBlockProps) => (props.title = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setProp((props: CountdownBlockProps) => (props.description = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Display Options */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Affichage</h4>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showDays}
              onChange={(e) => setProp((props: CountdownBlockProps) => (props.showDays = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les jours</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showHours}
              onChange={(e) => setProp((props: CountdownBlockProps) => (props.showHours = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les heures</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showMinutes}
              onChange={(e) => setProp((props: CountdownBlockProps) => (props.showMinutes = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les minutes</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSeconds}
              onChange={(e) => setProp((props: CountdownBlockProps) => (props.showSeconds = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les secondes</span>
          </label>
        </div>
      </div>
    </div>
  );
};

Countdown.craft = {
  displayName: 'Countdown',
  props: {
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'L\'événement commence dans',
    description: 'Ne manquez pas cette opportunité unique !',
    showDays: true,
    showHours: true,
    showMinutes: true,
    showSeconds: true,
  },
  related: {
    settings: CountdownSettings,
  },
};
