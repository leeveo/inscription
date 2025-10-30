'use client'

import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import type { FAQBlockProps } from '@/types/builder';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export const FAQ = ({
  title = 'Questions fréquentes',
  items = [
    {
      question: 'Comment puis-je m\'inscrire à l\'événement ?',
      answer: 'Cliquez sur le bouton "S\'inscrire" en haut de cette page et remplissez le formulaire d\'inscription.',
    },
    {
      question: 'Quel est le tarif de l\'événement ?',
      answer: 'L\'accès à l\'événement est gratuit pour tous les participants inscrits.',
    },
    {
      question: 'Puis-je annuler mon inscription ?',
      answer: 'Oui, vous pouvez annuler votre inscription jusqu\'à 48h avant l\'événement en nous contactant.',
    },
  ],
  accordion = true,
}: FAQBlockProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (accordion) {
      // Accordion mode: only one open at a time
      setOpenIndexes(openIndexes.includes(index) ? [] : [index]);
    } else {
      // Multiple items can be open
      setOpenIndexes(
        openIndexes.includes(index)
          ? openIndexes.filter(i => i !== index)
          : [...openIndexes, index]
      );
    }
  };

  const FAQItem = ({ item, index }: { item: typeof items[0]; index: number }) => {
    const isOpen = openIndexes.includes(index);

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleItem(index)}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
          {isOpen ? (
            <FiChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
          ) : (
            <FiChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
        </button>

        {isOpen && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-gray-700">{item.answer}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="relative w-full py-12 px-8 bg-gray-50"
      style={{
        border: selected || hovered ? '2px solid #3B82F6' : '2px solid transparent',
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-blue-600 text-white text-xs font-medium">
          FAQ {selected && '• Sélectionné'}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Title */}
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            {title}
          </h2>
        )}

        {/* FAQ Items */}
        <div className="space-y-4">
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <FAQItem key={index} item={item} index={index} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune question pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Settings component
export const FAQSettings = () => {
  const {
    actions: { setProp },
    title,
    items,
    accordion,
  } = useNode((node) => ({
    title: node.data.props.title,
    items: node.data.props.items,
    accordion: node.data.props.accordion,
  }));

  const addItem = () => {
    setProp((props: FAQBlockProps) => {
      if (!props.items) props.items = [];
      props.items.push({
        question: 'Nouvelle question',
        answer: 'Réponse à la question',
      });
    });
  };

  const removeItem = (index: number) => {
    setProp((props: FAQBlockProps) => {
      if (props.items) {
        props.items.splice(index, 1);
      }
    });
  };

  const updateItem = (index: number, field: 'question' | 'answer', value: string) => {
    setProp((props: FAQBlockProps) => {
      if (props.items && props.items[index]) {
        props.items[index][field] = value;
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contenu</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setProp((props: FAQBlockProps) => (props.title = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={accordion}
              onChange={(e) => setProp((props: FAQBlockProps) => (props.accordion = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mode accordéon (une seule question ouverte)</span>
          </label>
        </div>
      </div>

      {/* Items */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Questions ({items?.length || 0})</h4>
          <button
            onClick={addItem}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
          >
            + Ajouter
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {items && items.map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Question {index + 1}
                  </label>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => updateItem(index, 'question', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Réponse
                  </label>
                  <textarea
                    value={item.answer}
                    onChange={(e) => updateItem(index, 'answer', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    rows={2}
                  />
                </div>

                <button
                  onClick={() => removeItem(index)}
                  className="w-full px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

FAQ.craft = {
  displayName: 'FAQ',
  props: {
    title: 'Questions fréquentes',
    items: [
      {
        question: 'Comment puis-je m\'inscrire à l\'événement ?',
        answer: 'Cliquez sur le bouton "S\'inscrire" en haut de cette page et remplissez le formulaire d\'inscription.',
      },
      {
        question: 'Quel est le tarif de l\'événement ?',
        answer: 'L\'accès à l\'événement est gratuit pour tous les participants inscrits.',
      },
      {
        question: 'Puis-je annuler mon inscription ?',
        answer: 'Oui, vous pouvez annuler votre inscription jusqu\'à 48h avant l\'événement en nous contactant.',
      },
    ],
    accordion: true,
  },
  related: {
    settings: FAQSettings,
  },
};
