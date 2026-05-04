import { Bidding, BiddingService, SearchFilters, PncpContratacao, PncpPaginatedResponse, PaginatedResponse } from '../types/bidding';
import { MOCK_BIDDINGS } from '../data/biddingData';

function filterMockBiddings(items: Bidding[], filters?: SearchFilters): Bidding[] {
  return items.filter((item) => {
    if (filters?.query) {
      const searchTerm = normalize(filters.query);
      const searchableText = normalize(`${item.title} ${item.description} ${item.category}`);
      if (!searchableText.includes(searchTerm)) return false;
    }

    if (filters?.uf && filters.uf !== 'Todas') {
      if (!item.location?.includes(filters.uf)) return false;
    }

    if (filters?.modalidade) {
      const modalityNames = ['Leilão Eletrônico', 'Diálogo Competitivo', 'Concurso', 'Concorrência Eletrônica', 'Concorrência Presencial', 'Pregão Eletrônico', 'Pregão Presencial', 'Dispensa de Licitação', 'Inexigibilidade'];
      const modality = modalityNames[filters.modalidade - 1];
      if (modality && item.modalidade !== modality) return false;
    }

    if (filters?.category && filters.category !== 'Todas as Categorias') {
      if (!normalize(item.category || '').includes(normalize(filters.category))) return false;
    }

    if (filters?.status && filters.status !== 'Todos') {
      if (item.status !== filters.status) return false;
    }

    const value = item.value || item.valorEstimado || item.valorHomologado || 0;
    if (typeof filters?.valorMin === 'number' && value < filters.valorMin) return false;
    if (typeof filters?.valorMax === 'number' && value > filters.valorMax) return false;

    return true;
  });
}

const MODALITY_CODES: Record<string, number> = {
  'Leilão Eletrônico': 1,
  'Diálogo Competitivo': 2,
  'Concurso': 3,
  'Concorrência Eletrônica': 4,
  'Concorrência Presencial': 5,
  'Pregão Eletrônico': 6,
  'Pregão Presencial': 7,
  'Dispensa de Licitação': 8,
  'Inexigibilidade': 9,
  'Manifestação de Interesse': 10,
  'Pré-qualificação': 11,
  'Credenciamento': 12,
  'Leilão Presencial': 13,
};

const MODALITY_NAMES = Object.keys(MODALITY_CODES);

const PNCP_STATUS_MAP: Record<string, Bidding['status']> = {
  Divulgada: 'Divulgada',
  Publicada: 'Publicada',
  Aberta: 'Aberto',
  'Em Andamento': 'Em Andamento',
  Encerrada: 'Encerrado',
  Encerrado: 'Encerrado',
  Suspenso: 'Suspenso',
  Suspensa: 'Suspenso',
  Fracassada: 'Encerrado',
  Deserta: 'Encerrado',
  Anulada: 'Encerrado',
  Revogada: 'Encerrado',
};

function mapPncpStatus(rawStatus: string | undefined): Bidding['status'] {
  if (!rawStatus) return 'Divulgada';
  return PNCP_STATUS_MAP[rawStatus] || 'Divulgada';
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

function normalize(value: string | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function hasLocalFilters(filters?: SearchFilters): boolean {
  return Boolean(filters?.query || filters?.category || filters?.status || filters?.valorMin || filters?.valorMax);
}

function applyLocalFilters(items: Bidding[], filters?: SearchFilters): Bidding[] {
  if (!filters) return items;

  return items.filter((item) => {
    const value = item.valorEstimado || item.valorHomologado || item.value || 0;

    if (filters.query) {
      const searchTerm = normalize(filters.query);
      const searchableText = normalize(`${item.title} ${item.description} ${item.category} ${item.modalidade}`);
      if (!searchableText.includes(searchTerm)) return false;
    }

    if (filters.category && filters.category !== 'Todas as Categorias') {
      const haystack = normalize(`${item.category} ${item.modalidade} ${item.description}`);
      if (!haystack.includes(normalize(filters.category))) return false;
    }

    if (filters.status && filters.status !== 'Todos' && item.status !== filters.status) {
      return false;
    }

    if (typeof filters.valorMin === 'number' && value < filters.valorMin) {
      return false;
    }

    if (typeof filters.valorMax === 'number' && value > filters.valorMax) {
      return false;
    }

    return true;
  });
}

function mapPncpToBidding(item: PncpContratacao): Bidding {
  const id = `${item.orgaoEntidade.cnpj}-${item.anoCompra}-${item.sequencialCompra}`;
  return {
    id,
    title: item.objetoCompra,
    portal: 'PNCP',
    sourceUrl: item.linkSistemaOrigem || `https://pncp.gov.br/app/editais/${item.orgaoEntidade.cnpj}/${item.anoCompra}/${item.sequencialCompra}`,
    description: item.objetoCompra,
    value: item.valorTotalEstimado || item.valorTotalHomologado,
    location: item.municipioNome ? `${item.municipioNome}, ${item.ufNome}` : (item.ufNome || ''),
    openingDate: formatDate(item.dataAberturaProposta) || formatDate(item.dataPublicacaoPncp) || '',
    category: item.modalidadeNome || 'Não informada',
    status: mapPncpStatus(item.situacaoCompra),
    cnpjOrgao: item.orgaoEntidade.cnpj,
    nomeOrgao: item.orgaoEntidade.razaoSocial,
    modalidade: item.modalidadeNome,
    uf: item.ufNome,
    municipio: item.municipioNome,
    valorEstimado: item.valorTotalEstimado,
    valorHomologado: item.valorTotalHomologado,
    dataPublicacao: formatDate(item.dataPublicacaoPncp),
    dataAberturaProposta: formatDate(item.dataAberturaProposta),
    dataEncerramentoProposta: formatDate(item.dataEncerramentoProposta),
    linkOrigem: item.linkSistemaOrigem,
    situacao: item.situacaoCompra,
    codigoModalidade: item.modalidadeNome ? MODALITY_CODES[item.modalidadeNome] : undefined,
  };
}

export class PncpBiddingService implements BiddingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PNCP_API_BASE_URL || 'https://pncp.gov.br/api/consulta';
  }

  private formatDateForApi(date: Date | string): string {
    if (typeof date === 'string') {
      return date.replaceAll('-', '');
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private getDefaultDateRange(filters?: SearchFilters): { startDate: string; endDate: string } {
    const defaultDays = parseInt(process.env.DEFAULT_DAYS_RANGE || '30', 10);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - defaultDays);

    return {
      startDate: filters?.dataInicial ? this.formatDateForApi(filters.dataInicial) : this.formatDateForApi(startDate),
      endDate: filters?.dataFinal ? this.formatDateForApi(filters.dataFinal) : this.formatDateForApi(endDate),
    };
  }

  private async fetchFromPncp<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[PNCP API] Calling: ${url}`);
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status >= 500) {
        throw new Error('PNCP_API_UNAVAILABLE');
      }
      throw new Error(`PNCP API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async findAll(filters?: SearchFilters): Promise<PaginatedResponse<Bidding>> {
    const { startDate, endDate } = this.getDefaultDateRange(filters);
    const params = new URLSearchParams();
    params.append('pagina', String(filters?.pagina || 1));
    params.append('tamanhoPagina', String(filters?.tamanhoPagina || 50));
    params.append('dataInicial', startDate);
    params.append('dataFinal', endDate);

    if (filters?.modalidade) {
      params.append('codigoModalidadeContratacao', String(filters.modalidade));
    }

    if (filters?.uf) {
      params.append('uf', filters.uf);
    }

    const usePublicacaoForSearch = Boolean(filters?.query || filters?.modalidade || filters?.dataInicial || filters?.dataFinal);

    if (filters?.query) {
      params.append('objeto', filters.query);
    }

    const endpoint = usePublicacaoForSearch
      ? `/v1/contratacoes/publicacao?${params.toString()}`
      : `/v1/contratacoes/proposta?${params.toString()}`;

    try {
      const response = await this.fetchFromPncp<PncpPaginatedResponse<PncpContratacao>>(endpoint);

      if (!response.data || response.data.length === 0) {
        const mockFiltered = filterMockBiddings(MOCK_BIDDINGS, filters);
        return {
          items: mockFiltered,
          totalRegistros: mockFiltered.length,
          totalPaginas: 1,
          pagina: 1,
        };
      }

      const mappedItems = response.data.map(mapPncpToBidding);
      const filteredItems = applyLocalFilters(mappedItems, filters);
      const localFiltersApplied = hasLocalFilters(filters);

      return {
        items: filteredItems,
        totalRegistros: localFiltersApplied ? filteredItems.length : response.totalRegistros,
        totalPaginas: localFiltersApplied ? Math.max(1, Math.ceil(filteredItems.length / (filters?.tamanhoPagina || 50))) : response.totalPaginas,
        pagina: response.numeroPagina,
      };
    } catch (error) {
      console.warn('[PNCP API] Falha, usando dados mock:', error instanceof Error ? error.message : 'Unknown error');
      const mockFiltered = filterMockBiddings(MOCK_BIDDINGS, filters);
      return {
        items: mockFiltered,
        totalRegistros: mockFiltered.length,
        totalPaginas: 1,
        pagina: 1,
      };
    }
  }

  async findById(id: string): Promise<Bidding | null> {
    const parts = id.split('-');
    if (parts.length !== 3) {
      return null;
    }

    const [cnpj, ano, sequencial] = parts;
    const endpoint = `/v1/orgaos/${cnpj}/compras/${ano}/${sequencial}`;

    try {
      const response = await this.fetchFromPncp<PncpContratacao>(endpoint);
      return mapPncpToBidding(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'PNCP_API_UNAVAILABLE') {
        throw error;
      }
      return null;
    }
  }

  async getCategories(): Promise<string[]> {
    return MODALITY_NAMES;
  }

  async getModalidades(): Promise<string[]> {
    return MODALITY_NAMES;
  }

  async getByPropostaAberta(filters?: SearchFilters): Promise<Bidding[]> {
    const { endDate } = this.getDefaultDateRange(filters);
    const params = new URLSearchParams();
    params.append('dataFinal', endDate);
    params.append('pagina', String(filters?.pagina || 1));
    params.append('tamanhoPagina', String(filters?.tamanhoPagina || 50));

    if (filters?.modalidade) {
      params.append('codigoModalidadeContratacao', String(filters.modalidade));
    }

    if (filters?.uf) {
      params.append('uf', filters.uf);
    }

    const endpoint = `/v1/contratacoes/proposta?${params.toString()}`;
    const response = await this.fetchFromPncp<PncpPaginatedResponse<PncpContratacao>>(endpoint);

    if (!response.data || response.data.length === 0) {
      return [];
    }

    return applyLocalFilters(response.data.map(mapPncpToBidding), filters);
  }
}

export const pncpBiddingService = new PncpBiddingService();
