'use client'

import React, { useState, useEffect } from 'react';
import type { DataBinding, WhereClause, OrderByClause } from '@/types/builder';
import { FiDatabase, FiPlus, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// Available Supabase tables for binding
const AVAILABLE_TABLES = [
  { value: 'inscription_evenements', label: 'Événements', columns: ['id', 'nom', 'description', 'lieu', 'date_debut', 'date_fin', 'prix', 'organisateur', 'logo_url'] },
  { value: 'inscription_participants', label: 'Participants', columns: ['id', 'nom', 'prenom', 'email', 'telephone', 'profession', 'photo', 'url_linkedin', 'url_twitter'] },
  { value: 'inscription_intervenants', label: 'Intervenants', columns: ['id', 'nom', 'prenom', 'titre', 'biographie', 'photo_url', 'email', 'telephone', 'entreprise', 'site_web', 'url_linkedin', 'url_twitter', 'url_facebook', 'ordre'] },
  { value: 'inscription_sessions', label: 'Sessions', columns: ['id', 'titre', 'description', 'date', 'heure_debut', 'heure_fin', 'intervenant', 'lieu', 'type'] },
  { value: 'inscription_checkins', label: 'Check-ins', columns: ['id', 'participant_id', 'session_id', 'checked_in_at'] },
];

const OPERATORS = [
  { value: 'eq', label: '=' },
  { value: 'neq', label: '!=' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '>=' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '<=' },
  { value: 'like', label: 'LIKE' },
  { value: 'in', label: 'IN' },
];

interface DataBindingPanelProps {
  nodeProps: Record<string, any>;
  setProp: (cb: (props: any) => void) => void;
}

export default function DataBindingPanel({ nodeProps, setProp }: DataBindingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [binding, setBinding] = useState<DataBinding | undefined>(nodeProps.dataBinding);

  // Sync with node props
  useEffect(() => {
    setBinding(nodeProps.dataBinding);
  }, [nodeProps.dataBinding]);

  const selectedTable = AVAILABLE_TABLES.find(t => t.value === binding?.table);

  const handleTableChange = (table: string) => {
    const newBinding: DataBinding = {
      table,
      select: ['*'],
      where: [],
      orderBy: [],
      runtime: 'build',
    };
    setBinding(newBinding);
    setProp((props: any) => (props.dataBinding = newBinding));
  };

  const handleSelectChange = (columns: string[]) => {
    if (!binding) return;
    const updated = { ...binding, select: columns };
    setBinding(updated);
    setProp((props: any) => (props.dataBinding = updated));
  };

  const addWhereClause = () => {
    if (!binding) return;
    const newWhere: WhereClause = {
      column: selectedTable?.columns[0] || 'id',
      operator: 'eq',
      value: '',
    };
    const updated = { ...binding, where: [...(binding.where || []), newWhere] };
    setBinding(updated);
    setProp((props: any) => (props.dataBinding = updated));
  };

  const updateWhereClause = (index: number, field: keyof WhereClause, value: any) => {
    if (!binding?.where) return;
    const updated = { ...binding };
    updated.where![index] = { ...updated.where![index], [field]: value };
    setBinding(updated);
    setProp((props: any) => (props.dataBinding = updated));
  };

  const removeWhereClause = (index: number) => {
    if (!binding?.where) return;
    const updated = { ...binding, where: binding.where.filter((_, i) => i !== index) };
    setBinding(updated);
    setProp((props: any) => (props.dataBinding = updated));
  };

  const addOrderBy = () => {
    if (!binding) return;
    const newOrder: OrderByClause = {
      column: selectedTable?.columns[0] || 'id',
      ascending: true,
    };
    const updated = { ...binding, orderBy: [...(binding.orderBy || []), newOrder] };
    setBinding(updated);
    setProp((props: any) => (props.dataBinding = updated));
  };

  const updateOrderBy = (index: number, field: keyof OrderByClause, value: any) => {
    if (!binding?.orderBy) return;
    const updated = { ...binding };
    updated.orderBy![index] = { ...updated.orderBy![index], [field]: value };
    setBinding(updated);
    setProp((props: any) => (props.dataBinding = updated));
  };

  const removeOrderBy = (index: number) => {
    if (!binding?.orderBy) return;
    const updated = { ...binding, orderBy: binding.orderBy.filter((_, i) => i !== index) };
    setBinding(updated);
    setProp((props: any) => (props.dataBinding = updated));
  };

  const handleRuntimeChange = (runtime: 'build' | 'client') => {
    if (!binding) return;
    const updated = { ...binding, runtime };
    setBinding(updated);
    setProp((props: any) => (props.dataBinding = updated));
  };

  const handleLimitChange = (limit: number) => {
    if (!binding) return;
    const updated = { ...binding, limit: limit || undefined };
    setBinding(updated);
    setProp((props: any) => (props.dataBinding = updated));
  };

  const clearBinding = () => {
    setBinding(undefined);
    setProp((props: any) => (props.dataBinding = undefined));
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <FiDatabase className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">
            {binding ? `Lié à: ${selectedTable?.label}` : 'Lier aux données'}
          </span>
        </div>
        <FiChevronDown className="w-4 h-4 text-purple-600" />
      </button>
    );
  }

  return (
    <div className="space-y-4 border border-purple-200 rounded-lg p-4 bg-purple-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiDatabase className="w-4 h-4 text-purple-600" />
          <h4 className="text-sm font-semibold text-gray-900">Liaison de données</h4>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 hover:bg-purple-200 rounded transition-colors"
        >
          <FiChevronUp className="w-4 h-4 text-purple-600" />
        </button>
      </div>

      {/* Table Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Table source
        </label>
        <select
          value={binding?.table || ''}
          onChange={(e) => handleTableChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Sélectionner une table...</option>
          {AVAILABLE_TABLES.map(table => (
            <option key={table.value} value={table.value}>
              {table.label}
            </option>
          ))}
        </select>
      </div>

      {binding && selectedTable && (
        <>
          {/* Columns Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colonnes à afficher
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={binding.select.includes('*')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleSelectChange(['*']);
                    } else {
                      handleSelectChange([]);
                    }
                  }}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Toutes</span>
              </label>
            </div>

            {!binding.select.includes('*') && (
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {selectedTable.columns.map(column => (
                  <label key={column} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={binding.select.includes(column)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSelectChange([...binding.select, column]);
                        } else {
                          handleSelectChange(binding.select.filter(c => c !== column));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-700">{column}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* WHERE Clauses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Conditions (WHERE)
              </label>
              <button
                onClick={addWhereClause}
                className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
              >
                <FiPlus className="w-3 h-3" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-2">
              {binding.where?.map((clause, index) => (
                <div key={index} className="flex gap-2 items-start bg-white p-2 rounded border border-gray-200">
                  <select
                    value={clause.column}
                    onChange={(e) => updateWhereClause(index, 'column', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    {selectedTable.columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>

                  <select
                    value={clause.operator}
                    onChange={(e) => updateWhereClause(index, 'operator', e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    {OPERATORS.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={clause.value as string}
                    onChange={(e) => updateWhereClause(index, 'value', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="Valeur..."
                  />

                  <button
                    onClick={() => removeWhereClause(index)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ORDER BY */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Tri (ORDER BY)
              </label>
              <button
                onClick={addOrderBy}
                className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
              >
                <FiPlus className="w-3 h-3" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-2">
              {binding.orderBy?.map((order, index) => (
                <div key={index} className="flex gap-2 items-center bg-white p-2 rounded border border-gray-200">
                  <select
                    value={order.column}
                    onChange={(e) => updateOrderBy(index, 'column', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    {selectedTable.columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>

                  <select
                    value={order.ascending ? 'asc' : 'desc'}
                    onChange={(e) => updateOrderBy(index, 'ascending', e.target.value === 'asc')}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="asc">ASC ↑</option>
                    <option value="desc">DESC ↓</option>
                  </select>

                  <button
                    onClick={() => removeOrderBy(index)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* LIMIT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limite (LIMIT)
            </label>
            <input
              type="number"
              min="1"
              value={binding.limit || ''}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Aucune limite"
            />
          </div>

          {/* Runtime Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de chargement
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={binding.runtime === 'build'}
                  onChange={() => handleRuntimeChange('build')}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Build time (SSG)</span>
                  <p className="text-xs text-gray-500">Données chargées à la construction</p>
                </div>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={binding.runtime === 'client'}
                  onChange={() => handleRuntimeChange('client')}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Client side</span>
                  <p className="text-xs text-gray-500">Données chargées côté client</p>
                </div>
              </label>
            </div>
          </div>

          {/* Clear Button */}
          <button
            onClick={clearBinding}
            className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
          >
            Supprimer la liaison
          </button>
        </>
      )}
    </div>
  );
}
