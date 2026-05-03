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
  status: 'Aberto' | 'Encerrado' | 'Suspenso' | 'Em Andamento';
}

export interface SearchFilters {
  query: string;
  region: string;
  minVal: number;
  maxVal: number;
  category: string;
}
