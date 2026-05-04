export type BiddingStatus = 'Aberto' | 'Encerrado' | 'Suspenso' | 'Em Andamento' | 'Divulgada' | 'Publicada';

export interface Bidding {
  id: string;
  title: string;
  portal: string;
  sourceUrl: string;
  description: string;
  value?: number;
  location: string;
  openingDate: string;
  category: string;
  status: BiddingStatus;
  // Campos PNCP
  cnpjOrgao?: string;
  nomeOrgao?: string;
  modalidade?: string;
  uf?: string;
  municipio?: string;
  valorEstimado?: number;
  valorHomologado?: number;
  dataPublicacao?: string;
  dataAberturaProposta?: string;
  dataEncerramentoProposta?: string;
  linkOrigem?: string;
  situacao?: string;
  codigoModalidade?: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  uf?: string;
  modalidade?: number;
  valorMin?: number;
  valorMax?: number;
  dataInicial?: string;
  dataFinal?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export interface PncpContratacao {
  orgaoEntidade: {
    cnpj: string;
    razaoSocial: string;
  };
  objetoCompra: string;
  valorTotalEstimado?: number;
  valorTotalHomologado?: number;
  anoCompra: number;
  sequencialCompra: number;
  dataPublicacaoPncp?: string;
  dataAberturaProposta?: string;
  dataEncerramentoProposta?: string;
  modalidadeNome?: string;
  amparoLegal?: string;
  ufNome?: string;
  municipioNome?: string;
  linkSistemaOrigem?: string;
  situacaoCompra?: string;
}

export interface PncpPaginatedResponse<T> {
  data: T[];
  totalRegistros: number;
  totalPaginas: number;
  numeroPagina: number;
  paginasRestantes: number;
  empty: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalRegistros: number;
  totalPaginas: number;
  pagina: number;
}

export interface BiddingService {
  findAll(filters?: SearchFilters): Promise<PaginatedResponse<Bidding>>;
  findById(id: string): Promise<Bidding | null>;
  getCategories(): Promise<string[]>;
  getModalidades(): Promise<string[]>;
}
