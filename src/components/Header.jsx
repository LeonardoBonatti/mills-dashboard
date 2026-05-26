import React from 'react';
import { Bell, User, Search, Filter, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import ExcelUpload from './ExcelUpload';

const PAGE_TITLES = {
  '/': 'Visão Geral Executiva',
  '/base-manutencao': 'Base de Manutenção',
  '/controle-filas': 'Controle de Filas',
  '/gestao-pecas': 'Gestão de Peças',
  '/registro-falhas': 'Registro de Falhas',
  '/kpis-volume': 'KPIs Volume',
  '/kpis-sla': 'KPIs SLA',
  '/kpis-etapas': 'KPIs Etapas',
  '/kpis-gargalos': 'KPIs Gargalos',
  '/analise-falhas': 'Análise de Falhas',
  '/orcamento-aprovacao': 'Orçamento e Aprovação',
  '/processo-melhoria': 'Processo e Melhoria',
  '/calendario': 'Calendário',
};

const Header = () => {
  const location = useLocation();
  const { filters, updateFilter, uniqueValues, filteredData, globalData } = useDashboard();
  const isFiltered = filters.search || filters.status !== 'Todos' || filters.modelo !== 'Todos' || filters.falha !== 'Todos';

  const clearFilters = () => {
    updateFilter('search', '');
    updateFilter('status', 'Todos');
    updateFilter('modelo', 'Todos');
    updateFilter('falha', 'Todos');
  };

  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 32px',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {PAGE_TITLES[location.pathname] || 'Dashboard'}
          </h1>
          <span style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)', padding: '2px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' }}>
            {filteredData.length} / {globalData.length} OS
          </span>
          {isFiltered && (
            <span style={{ background: 'var(--status-warning-bg)', color: 'var(--status-warning)', padding: '2px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' }}>
              Filtros Ativos
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Oficina: <strong style={{ color: 'var(--accent-primary)' }}>Sumaré · Frota CAT</strong></span>
          <ExcelUpload />
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="white" />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Filter size={16} color="var(--accent-primary)" />

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: 'var(--border-radius-sm)', flex: '0 0 280px', border: '1px solid var(--border-color)' }}>
          <Search size={14} color="var(--text-muted)" style={{ marginRight: '8px', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar OS, Série ou Modelo..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.875rem' }}
          />
          {filters.search && <X size={14} color="var(--text-muted)" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => updateFilter('search', '')} />}
        </div>

        {/* Status */}
        <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--border-radius-sm)', outline: 'none', fontSize: '0.875rem' }}>
          <option value="Todos">Todos os Status</option>
          {(uniqueValues?.status || []).map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Modelo */}
        <select value={filters.modelo} onChange={(e) => updateFilter('modelo', e.target.value)}
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--border-radius-sm)', outline: 'none', fontSize: '0.875rem' }}>
          <option value="Todos">Todos os Modelos</option>
          {(uniqueValues?.modelos || []).map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        {/* Falha */}
        <select value={filters.falha} onChange={(e) => updateFilter('falha', e.target.value)}
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--border-radius-sm)', outline: 'none', fontSize: '0.875rem' }}>
          <option value="Todos">Tipo de Falha</option>
          {(uniqueValues?.falhas || []).map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        {isFiltered && (
          <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--status-danger-bg)', color: 'var(--status-danger)', border: 'none', padding: '6px 12px', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
            <X size={14} /> Limpar
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
