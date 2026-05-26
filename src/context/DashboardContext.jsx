import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import rawData from '../data/Base_Manutenção.json';
import { normalizeOS, calcularEtapas, parseDate } from '../utils/dataUtils';

const DashboardContext = createContext();
export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    search: '',
    modelo: 'Todos',
    status: 'Todos',
    falha: 'Todos',
  });

  // Normalize all rows — skip header row initially using dummy data
  const [globalData, setGlobalData] = useState(() => {
    return rawData
      .map(normalizeOS)
      .filter(Boolean)
      .filter(row => typeof row.ID_OS === 'number' || (typeof row.ID_OS === 'string' && row.ID_OS.trim() !== ''));
  });

  // Apply filters reactively
  const filteredData = useMemo(() => {
    return globalData.filter(item => {
      const searchTerm = filters.search.toLowerCase();
      if (searchTerm) {
        const osMatch = String(item.ID_OS || '').toLowerCase().includes(searchTerm);
        const serieMatch = String(item.Serie || '').toLowerCase().includes(searchTerm);
        const modelMatch = String(item.Modelo || '').toLowerCase().includes(searchTerm);
        if (!osMatch && !serieMatch && !modelMatch) return false;
      }
      if (filters.status !== 'Todos' && item.StatusFinal !== filters.status) return false;
      if (filters.modelo !== 'Todos' && !(item.Modelo || '').includes(filters.modelo)) return false;
      if (filters.falha !== 'Todos' && item.MotivoParada !== filters.falha) return false;
      return true;
    });
  }, [globalData, filters]);

  // Pre-computed KPIs used across all pages
  const kpis = useMemo(() => {
    const total = filteredData.length;
    const finalizados = filteredData.filter(d => d.StatusFinal === 'Finalizado').length;
    const aguardandoPeca = filteredData.filter(d => d.StatusFinal === 'Aguardando Peça').length;
    const emAndamento = filteredData.filter(d => d.StatusFinal === 'Em Andamento').length;
    const comAtrasosPecas = filteredData.filter(d => d.AtrasosPecas === 'Sim').length;
    const pecasImportadas = filteredData.filter(d => d.PecasImportadas === 'Sim').length;

    // SLA: avg total days for finalized OS
    let totalDias = 0; let countDias = 0;
    let etapasSum = { entradaOficina: 0, diagnostico: 0, aprovacao: 0, pecas: 0, execucao: 0, teste: 0 };
    let etapasCount = { entradaOficina: 0, diagnostico: 0, aprovacao: 0, pecas: 0, execucao: 0, teste: 0 };

    filteredData.forEach(item => {
      const e = calcularEtapas(item);
      if (e.totalOS !== null && e.totalOS > 0) { totalDias += e.totalOS; countDias++; }
      Object.keys(etapasSum).forEach(k => {
        if (e[k] !== null && e[k] > 0) { etapasSum[k] += e[k]; etapasCount[k]++; }
      });
    });

    const avgDias = countDias > 0 ? (totalDias / countDias).toFixed(1) : 'N/A';
    const etapasMedia = {};
    Object.keys(etapasSum).forEach(k => {
      etapasMedia[k] = etapasCount[k] > 0 ? Math.round(etapasSum[k] / etapasCount[k]) : 0;
    });

    // Status distribution
    const statusMap = {};
    filteredData.forEach(d => {
      const s = d.StatusFinal || 'Sem Status';
      statusMap[s] = (statusMap[s] || 0) + 1;
    });

    // Motivo parada distribution
    const motivoMap = {};
    filteredData.forEach(d => {
      const m = d.MotivoParada || 'Não Informado';
      motivoMap[m] = (motivoMap[m] || 0) + 1;
    });

    // Componente distribution
    const componenteMap = {};
    filteredData.forEach(d => {
      const c = d.Componente || 'Não Informado';
      componenteMap[c] = (componenteMap[c] || 0) + 1;
    });

    // Modelo distribution
    const modeloMap = {};
    filteredData.forEach(d => {
      const m = d.Modelo || 'N/A';
      modeloMap[m] = (modeloMap[m] || 0) + 1;
    });

    // Monthly volume — use DataOficina
    const monthMap = {};
    filteredData.forEach(d => {
      const dt = parseDate(d.DataOficina);
      if (dt) {
        const key = `${dt.getMonth() + 1}/${dt.getFullYear()}`;
        monthMap[key] = (monthMap[key] || 0) + 1;
      }
    });

    return {
      total, finalizados, aguardandoPeca, emAndamento,
      comAtrasosPecas, pecasImportadas,
      avgDias, etapasMedia,
      statusDist: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
      motivoDist: Object.entries(motivoMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value })),
      componenteDist: Object.entries(componenteMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value })),
      modeloDist: Object.entries(modeloMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })),
      monthlyVolume: Object.entries(monthMap).sort().map(([name, value]) => ({ name, value })),
    };
  }, [filteredData]);

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  // Unique values for filter dropdowns
  const uniqueValues = useMemo(() => ({
    modelos: [...new Set(globalData.map(d => d.Modelo).filter(Boolean))].sort(),
    status: [...new Set(globalData.map(d => d.StatusFinal).filter(Boolean))].sort(),
    falhas: [...new Set(globalData.map(d => d.MotivoParada).filter(Boolean))].sort(),
  }), [globalData]);

  return (
    <DashboardContext.Provider value={{ globalData, setGlobalData, filteredData, filters, updateFilter, kpis, uniqueValues }}>
      {children}
    </DashboardContext.Provider>
  );
};
