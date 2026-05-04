'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ShieldCheck,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Bidding } from '@/lib/types/bidding';

interface PaginatedResponse<T> {
  items: T[];
  totalRegistros: number;
  totalPaginas: number;
  pagina: number;
}

const UFS = ['Todas', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const CATEGORIAS = ['Todas as Categorias', 'Obras Civis', 'Tecnologia', 'Saúde', 'Serviços Limpeza', 'Alimentos', 'Serviços', 'Materiais', 'Locação', 'Outros'];

const STATUS_OPTIONS = ['Todos', 'Aberto', 'Encerrado', 'Em Andamento', 'Divulgada', 'Publicada', 'Suspenso'];

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
};

const DEFAULT_MAX_VALUE = 10000000;

async function searchBiddings(params: {
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
}): Promise<PaginatedResponse<Bidding>> {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.append('search', params.query);
  if (params.uf && params.uf !== 'Todas') searchParams.append('uf', params.uf);
  if (params.modalidade) searchParams.append('modalidade', String(params.modalidade));
  if (params.category) searchParams.append('category', params.category);
  if (params.status) searchParams.append('status', params.status);
  if (params.valorMin) searchParams.append('valorMin', String(params.valorMin));
  if (params.valorMax) searchParams.append('valorMax', String(params.valorMax));
  if (params.dataInicial) searchParams.append('dataInicial', params.dataInicial);
  if (params.dataFinal) searchParams.append('dataFinal', params.dataFinal);
  searchParams.append('pagina', String(params.pagina || 1));
  searchParams.append('tamanhoPagina', '50');

  const response = await fetch(`/api/licitacoes?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

async function getModalidades(): Promise<string[]> {
  const response = await fetch('/api/licitacoes/modalidades');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

export default function Home() {
  const [biddings, setBiddings] = useState<Bidding[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBidding, setSelectedBidding] = useState<Bidding | null>(null);
  const [modalidades, setModalidades] = useState<string[]>([]);
  const [activeModalidade, setActiveModalidade] = useState('');
  const [activeUf, setActiveUf] = useState('Todas');
  const [activeStatus, setActiveStatus] = useState('Todos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [filterCategoria, setFilterCategoria] = useState('Todas as Categorias');
  const [valorMin, setValorMin] = useState(0);
  const [valorMax, setValorMax] = useState(DEFAULT_MAX_VALUE);
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    getModalidades().then(setModalidades).catch(console.error);
  }, []);

  const getModalidadeCode = (nome: string): number => MODALITY_CODES[nome] || 0;

  const buildSearchQuery = useCallback((query = searchQuery, process = processNumber) => {
    return [query.trim(), process.trim()].filter(Boolean).join(' ');
  }, [searchQuery, processNumber]);

  const executeSearch = useCallback(async (page = 1, overrides: Partial<{
    query: string;
    process: string;
    uf: string;
    modalidade: string;
    category: string;
    status: string;
    min: number;
    max: number;
    start: string;
    end: string;
  }> = {}) => {
    const selectedModalidade = overrides?.modalidade ?? activeModalidade;
    const query = overrides?.query ?? searchQuery;
    const process = overrides?.process ?? processNumber;
    const uf = overrides?.uf ?? activeUf;
    const category = overrides?.category ?? filterCategoria;
    const status = overrides?.status ?? activeStatus;
    const min = overrides?.min ?? valorMin;
    const max = overrides?.max ?? valorMax;
    const start = overrides?.start ?? dataInicial;
    const end = overrides?.end ?? dataFinal;

    try {
      setLoading(true);
      setBiddings([]);
      setTotalRegistros(0);
      const response = await searchBiddings({
        query: buildSearchQuery(query, process),
        uf,
        modalidade: selectedModalidade ? getModalidadeCode(selectedModalidade) : 0,
        category,
        status,
        valorMin: min,
        valorMax: max,
        dataInicial: start,
        dataFinal: end,
        pagina: page,
      });
      setBiddings(response.items || []);
      setTotalPages(Math.max(1, response.totalPaginas || 1));
      setTotalRegistros(response.totalRegistros || 0);
    } catch (error) {
      console.error('Erro na busca:', error);
      setBiddings([]);
      setTotalPages(1);
      setTotalRegistros(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, processNumber, activeModalidade, activeUf, activeStatus, filterCategoria, valorMin, valorMax, dataInicial, dataFinal, buildSearchQuery]);

  useEffect(() => {
    if (!initialLoadDone) {
      executeSearch(1);
      setInitialLoadDone(true);
    }
  }, [initialLoadDone, executeSearch]);

  useEffect(() => {
    if (initialLoadDone) {
      setCurrentPage(1);
      executeSearch(1);
    }
  }, [initialLoadDone, activeModalidade, activeUf, activeStatus, executeSearch]);

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    executeSearch(1);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveModalidade('');
    setActiveUf('Todas');
    setActiveStatus('Todos');
    setFilterCategoria('Todas as Categorias');
    setValorMin(0);
    setValorMax(DEFAULT_MAX_VALUE);
    setDataInicial('');
    setDataFinal('');
    setProcessNumber('');
    setCurrentPage(1);
    executeSearch(1, {
      query: '',
      process: '',
      uf: 'Todas',
      modalidade: '',
      category: 'Todas as Categorias',
      status: 'Todos',
      min: 0,
      max: DEFAULT_MAX_VALUE,
      start: '',
      end: '',
    });
  };

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(nextPage);
    executeSearch(nextPage);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters();
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Encerrado': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'Em Andamento': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] flex flex-col">
      <header className="bg-gradient-to-r from-[#0f1629] via-[#0a0e27] to-[#0f1629] border-b border-white/5">
        <div className="px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#2563eb] flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl lg:text-2xl font-bold text-white tracking-tight">LICITHUB</span>
                <p className="text-[10px] text-cyan-400 font-medium tracking-widest hidden sm:block">AGREGADOR INTELIGENTE</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <section className="bg-[#0f1629]/50 border-b border-white/5">
        <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-6">
          <form onSubmit={applyFilters} className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar licitações por objeto, modalidade ou órgão"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={onSearchKeyDown}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto lg:overflow-visible no-scrollbar">
              <select
                value={activeUf}
                onChange={(e) => setActiveUf(e.target.value)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              >
                {UFS.map((uf) => (
                  <option key={uf} value={uf} className="bg-[#0f1629]">{uf === 'Todas' ? 'Todos os Estados' : uf}</option>
                ))}
              </select>
              <select
                value={activeModalidade}
                onChange={(e) => setActiveModalidade(e.target.value)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              >
                <option value="" className="bg-[#0f1629]">Todas Modalidades</option>
                {modalidades.map((mod) => (
                  <option key={mod} value={mod} className="bg-[#0f1629]">{mod}</option>
                ))}
              </select>
              <select
                value={activeStatus}
                onChange={(e) => setActiveStatus(e.target.value)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status} className="bg-[#0f1629]">{status === 'Todos' ? 'Todos Status' : status}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-cyan-400/25 active:scale-[0.98]"
              >
                <SlidersHorizontal size={14} />
                <span>Busca Avançada</span>
              </button>
            </div>
          </form>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={applyFilters} className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[240px]">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Data de Publicação</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={dataInicial}
                          onChange={(e) => setDataInicial(e.target.value)}
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                        />
                        <span className="text-gray-500">até</span>
                        <input
                          type="date"
                          value={dataFinal}
                          onChange={(e) => setDataFinal(e.target.value)}
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Número do Processo</label>
                      <input
                        type="text"
                        value={processNumber}
                        onChange={(e) => setProcessNumber(e.target.value)}
                        placeholder="Ex: 001/2024"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all hover:shadow-lg hover:shadow-cyan-400/25 active:scale-[0.98]">
                        Aplicar Filtros
                      </button>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="p-2 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <RotateCcw size={18} />
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <main className="flex-1 px-4 sm:px-6 lg:px-10 xl:px-16 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 xl:w-72 shrink-0 order-2 lg:order-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-white">Filtros</h3>
                  <button onClick={resetFilters} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                    <RotateCcw size={16} />
                  </button>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Estado</label>
                  <select
                    value={activeUf}
                    onChange={(e) => setActiveUf(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  >
                    {UFS.map((uf) => (
                      <option key={uf} value={uf} className="bg-[#0f1629]">{uf === 'Todas' ? 'Todos os Estados' : uf}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Categoria</label>
                  <select
                    value={filterCategoria}
                    onChange={(e) => setFilterCategoria(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0f1629]">{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Valor (R$)</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Min</span>
                      <span className="text-white font-medium">R$ {valorMin.toLocaleString('pt-BR')}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={DEFAULT_MAX_VALUE}
                      step="10000"
                      value={valorMin}
                      onChange={(e) => setValorMin(Math.min(Number(e.target.value), valorMax))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Max</span>
                      <span className="text-white font-medium">R$ {valorMax.toLocaleString('pt-BR')}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={DEFAULT_MAX_VALUE}
                      step="10000"
                      value={valorMax}
                      onChange={(e) => setValorMax(Math.max(Number(e.target.value), valorMin))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={applyFilters}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold px-4 py-3 rounded-lg text-sm transition-all hover:shadow-lg hover:shadow-cyan-400/25 active:scale-[0.98]"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0 order-1 lg:order-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Licitações Recentes</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {loading ? 'Buscando...' : `${totalRegistros} licitações encontradas`}
                </p>
              </div>

              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={() => goToPage(currentPage - 1)}
                onNext={() => goToPage(currentPage + 1)}
              />
            </div>

            <div className="relative">
              {loading && biddings.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-2xl p-5 border border-white/10 bg-white/5 animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/10" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/10 rounded w-3/4" />
                          <div className="h-3 bg-white/5 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-white/10 rounded" />
                        <div className="h-3 bg-white/5 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : biddings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-white/10 bg-white/5">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Nenhuma licitação encontrada</h3>
                  <p className="text-sm text-gray-400 max-w-xs">
                    Tente ajustar os filtros ou usar termos de busca diferentes.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {biddings.map((bidding, index) => (
                    bidding && bidding.id ? (
                      <motion.div
                        key={bidding.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                        onClick={() => setSelectedBidding(bidding)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(bidding.status)}`}>
                            {bidding.status}
                          </span>
                          <span className="text-xs text-gray-500">{bidding.portal}</span>
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{bidding.title}</h3>
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{bidding.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{bidding.location}</span>
                          <span className="text-cyan-400 font-medium">{formatCurrency(bidding.value)}</span>
                        </div>
                      </motion.div>
                    ) : null
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center mt-8 gap-3">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={() => goToPage(currentPage - 1)}
                onNext={() => goToPage(currentPage + 1)}
              />
            </div>
          </div>

          <aside className="lg:w-72 xl:w-80 shrink-0 order-3">
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Análises</h3>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Modalidade</span>
                    <span className="text-xs text-cyan-400 font-medium">68%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-cyan-400/30 bg-cyan-400/10 text-cyan-400">Novidade</span>
                </div>
                <button className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  <span>Ver mais</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>

              <div className="bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-2xl p-5 border border-cyan-400/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">Licitações Ativas</span>
                  <TrendingUp size={14} className="text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-white">2.847</p>
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp size={10} />
                  +12% este mês
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <AnimatePresence>
        {selectedBidding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBidding(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f1629] rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedBidding.status)}`}>
                  {selectedBidding.status}
                </span>
                <button onClick={() => setSelectedBidding(null)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-white mb-4">{selectedBidding.title}</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Valor:</span>
                  <span className="text-white ml-2 font-semibold">{formatCurrency(selectedBidding.value)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Localização:</span>
                  <span className="text-white ml-2">{selectedBidding.location}</span>
                </div>
                <div>
                  <span className="text-gray-400">Modalidade:</span>
                  <span className="text-white ml-2">{selectedBidding.modalidade || selectedBidding.category}</span>
                </div>
                <div>
                  <span className="text-gray-400">Data de Abertura:</span>
                  <span className="text-white ml-2">{selectedBidding.openingDate || selectedBidding.dataAberturaProposta}</span>
                </div>
                {selectedBidding.nomeOrgao && (
                  <div>
                    <span className="text-gray-400">Órgão:</span>
                    <span className="text-white ml-2">{selectedBidding.nomeOrgao}</span>
                  </div>
                )}
                {selectedBidding.cnpjOrgao && (
                  <div>
                    <span className="text-gray-400">CNPJ:</span>
                    <span className="text-white ml-2">{selectedBidding.cnpjOrgao}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-300 mt-4 text-sm">{selectedBidding.description}</p>
              <a
                href={selectedBidding.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
              >
                Ver no portal original
                <ArrowUpRight size={14} />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrevious}
        className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-gray-400 hover:text-white disabled:opacity-30"
        disabled={currentPage === 1}
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-sm text-white font-medium min-w-[60px] text-center">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={onNext}
        className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-gray-400 hover:text-white disabled:opacity-30"
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}