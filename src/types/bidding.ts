/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  status: 'Aberto' | 'Encerrado' | 'Suspenso' | 'Em Andamento' | 'Divulgada' | 'Publicada';
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
