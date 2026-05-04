/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bidding } from "../types/bidding";

export interface PaginatedResponse<T> {
  items: T[];
  totalRegistros: number;
  totalPaginas: number;
  pagina: number;
}

export interface SearchBiddingsParams {
  query?: string;
  uf?: string;
  modalidade?: number;
  category?: string;
  status?: string;
  valorMin?: number;
  valorMax?: number;
  dataInicial?: string;
  dataFinal?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export const searchBiddings = async ({
  query = '',
  uf = '',
  modalidade = 0,
  category = '',
  status = '',
  valorMin,
  valorMax,
  dataInicial = '',
  dataFinal = '',
  pagina = 1,
  tamanhoPagina = 50,
}: SearchBiddingsParams = {}): Promise<PaginatedResponse<Bidding>> => {
  const params = new URLSearchParams();

  if (query && query.trim() !== '') {
    params.append('search', query);
  }

  if (uf && uf !== 'Todas') {
    params.append('uf', uf);
  }

  if (modalidade > 0) {
    params.append('modalidade', String(modalidade));
  }

  if (category && category !== 'Todas as Categorias') {
    params.append('category', category);
  }

  if (status && status !== 'Todos') {
    params.append('status', status);
  }

  if (typeof valorMin === 'number' && valorMin > 0) {
    params.append('valorMin', String(valorMin));
  }

  if (typeof valorMax === 'number' && valorMax < 10000000) {
    params.append('valorMax', String(valorMax));
  }

  if (dataInicial) {
    params.append('dataInicial', dataInicial);
  }

  if (dataFinal) {
    params.append('dataFinal', dataFinal);
  }

  params.append('pagina', String(pagina));
  params.append('tamanhoPagina', String(tamanhoPagina));

  const baseUrl = import.meta.env.VITE_API_URL || '';
  const url = `${baseUrl}/api/licitacoes${params.toString() ? `?${params.toString()}` : ''}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data: PaginatedResponse<Bidding> = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar licitações:', error);
    throw error;
  }
};

export const getBiddingById = async (id: string): Promise<Bidding | null> => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  try {
    const response = await fetch(`${baseUrl}/api/licitacoes/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data: Bidding = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar licitação:', error);
    throw error;
  }
};

export const getModalidades = async (): Promise<string[]> => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  try {
    const response = await fetch(`${baseUrl}/api/licitacoes/modalidades`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data: string[] = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar modalidades:', error);
    throw error;
  }
};
