// Normaliza os dados brutos da planilha (que chegam com Col_0, Col_1, etc.)
// para um objeto com nomes legíveis
export const normalizeOS = (raw) => {
  // A primeira linha do JSON é o mapa de cabeçalhos — ignoramos ela
  const firstKey = Object.keys(raw)[0];
  const isHeaderRow = firstKey === 'Registro completo do ciclo de vida de cada Ordem de Serviço' && typeof raw[firstKey] === 'string';
  if (isHeaderRow) return null;

  return {
    ID_OS: String(raw['Registro completo do ciclo de vida de cada Ordem de Serviço'] || raw['ID_OS'] || '').trim() || null,
    CentroTrab: typeof raw['Col_1'] === 'string' ? raw['Col_1'].trim() : raw['Col_1'],
    DescCentroTrab: typeof raw['Col_2'] === 'string' ? raw['Col_2'].trim() : raw['Col_2'],
    TextoOS: typeof raw['Col_3'] === 'string' ? raw['Col_3'].trim() : raw['Col_3'],
    TAM: typeof raw['Col_4'] === 'string' ? raw['Col_4'].trim() : raw['Col_4'],
    DescTAM: typeof raw['Col_5'] === 'string' ? raw['Col_5'].trim() : raw['Col_5'],
    Frota: typeof raw['Col_6'] === 'string' ? raw['Col_6'].trim() : raw['Col_6'],
    Serie: typeof raw['Col_7'] === 'string' ? raw['Col_7'].trim() : raw['Col_7'],
    NomeCliente: typeof raw['Col_8'] === 'string' ? raw['Col_8'].trim() : raw['Col_8'],
    NomeFilial: typeof raw['Col_9'] === 'string' ? raw['Col_9'].trim() : raw['Col_9'],
    Filial: typeof raw['Col_10'] === 'string' ? raw['Col_10'].trim() : raw['Col_10'],
    DataAbertura: raw['Col_11'],
    DataOficina: raw['Col_12'],
    DataNegociacao: raw['Col_13'],
    DataAprovacao: raw['Col_14'],
    DataNP: raw['Col_15'],
    DataProducao: raw['Col_16'],
    DataConclusao: raw['Col_17'],
    DataFechamento: raw['Col_18'],
    DataDigOC: raw['Col_19'],
    DataDigPR: raw['Col_20'],
    DescCompCode: typeof raw['Col_21'] === 'string' ? raw['Col_21'].trim() : raw['Col_21'],
    DataNota: raw['Col_22'],
    Componente: typeof raw['Col_23'] === 'string' ? raw['Col_23'].trim() : raw['Col_23'],
    MotivoParada: typeof raw['Col_24'] === 'string' ? raw['Col_24'].trim() : raw['Col_24'],
    PecasImportadas: typeof raw['Col_25'] === 'string' ? raw['Col_25'].trim() : raw['Col_25'],
    AtrasosPecas: typeof raw['Col_26'] === 'string' ? raw['Col_26'].trim() : raw['Col_26'],
    StatusFinal: typeof raw['Col_27'] === 'string' ? raw['Col_27'].trim() : raw['Col_27'],
    Observacoes: typeof raw['Col_28'] === 'string' ? raw['Col_28'].trim() : raw['Col_28'],
    Modelo: (raw['Col_3'] || '').replace('Manutenção ', '').trim(),
  };
};

// Parse DD/MM/YYYY or Excel serial date
export const parseDate = (val) => {
  if (!val) return null;
  if (typeof val === 'number') {
    // Excel serial date
    const utc_days = Math.floor(val - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000);
  }
  if (typeof val === 'string' && val.includes('/')) {
    const [d, m, y] = val.split('/');
    if (!d || !m || !y) return null;
    const year = y.length === 2 ? '20' + y : y;
    return new Date(`${year}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
  }
  return null;
};

export const diffDays = (d1, d2) => {
  if (!d1 || !d2) return null;
  const diffMs = d2 - d1;
  // If end date is before start date, or if the diff is absurd (> 2000 days / ~5.5 years), it's probably invalid data
  if (diffMs < 0) return 0;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days > 2000 ? null : days;
};

// Calcula SLA de uma OS e retorna os dias por etapa
export const calcularEtapas = (os) => {
  const ab = parseDate(os.DataAbertura);
  const oc = parseDate(os.DataOficina);
  const ng = parseDate(os.DataNegociacao);
  const ap = parseDate(os.DataAprovacao);
  const np = parseDate(os.DataNP);
  const pr = parseDate(os.DataProducao);
  const co = parseDate(os.DataConclusao);
  const fc = parseDate(os.DataFechamento);

  return {
    entradaOficina: diffDays(ab, oc),
    diagnostico: diffDays(oc, ng),
    aprovacao: diffDays(ng, ap),
    pecas: diffDays(ap, np),
    execucao: diffDays(np, pr),
    teste: diffDays(pr, co),
    fechamento: diffDays(co, fc),
    totalOS: diffDays(ab, fc) || diffDays(ab, co),
  };
};

export const getSLAColor = (status, dias) => {
  if (status === 'Finalizado' && dias !== null && dias <= 30) return 'var(--status-success)';
  if (status === 'Aguardando Peça') return 'var(--status-danger)';
  if (dias !== null && dias > 30) return 'var(--status-danger)';
  return 'var(--status-warning)';
};

export const getSLABadge = (status, dias) => {
  if (status === 'Finalizado' && (dias === null || dias <= 30)) return { cls: 'badge-success', txt: 'No Prazo' };
  if (status === 'Aguardando Peça') return { cls: 'badge-danger', txt: 'Crítico' };
  if (dias !== null && dias > 30) return { cls: 'badge-danger', txt: 'Atrasado' };
  return { cls: 'badge-warning', txt: 'Atenção' };
};
