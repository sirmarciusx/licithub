/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  ShieldCheck,
  Zap,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  User,
  ArrowUpRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Bidding } from './types/bidding';
import { BiddingCard } from './components/BiddingCard';
import { BiddingModal } from './components/BiddingModal';
import { CustomSelect } from './components/CustomSelect';
import { searchBiddings, getModalidades } from './services/api';
import { UFS, CATEGORIAS, MODALITY_CODES, STATUS_OPTIONS } from './constants/bidding';

const DEFAULT_MAX_VALUE = 10000000;

export default function App() {
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
  const isInitialFiltersRender = useRef(true);

  useEffect(() => {
    const loadModalidades = async () => {
      try {
        const mods = await getModalidades();
        setModalidades(mods);
      } catch (error) {
        console.error('Erro ao carregar modalidades:', error);
      }
    };
    loadModalidades();
  }, []);

  const getModalidadeCode = (nome: string): number => MODALITY_CODES[nome] || 0;

  const buildSearchQuery = (query = searchQuery, process = processNumber) => {
    return [query.trim(), process.trim()].filter(Boolean).join(' ');
  };

  const executeSearch = async (
    page = currentPage,
    overrides: Partial<{
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
    }> = {}
  ) => {
    const selectedModalidade = overrides.modalidade ?? activeModalidade;

    try {
      setLoading(true);
      setBiddings([]);
      setTotalRegistros(0);

      const response = await searchBiddings({
        query: buildSearchQuery(overrides.query ?? searchQuery, overrides.process ?? processNumber),
        uf: overrides.uf ?? activeUf,
        modalidade: selectedModalidade ? getModalidadeCode(selectedModalidade) : 0,
        category: overrides.category ?? filterCategoria,
        status: overrides.status ?? activeStatus,
        valorMin: overrides.min ?? valorMin,
        valorMax: overrides.max ?? valorMax,
        dataInicial: overrides.start ?? dataInicial,
        dataFinal: overrides.end ?? dataFinal,
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
  };

  useEffect(() => {
    executeSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isInitialFiltersRender.current) {
      isInitialFiltersRender.current = false;
      return;
    }

    setCurrentPage(1);
    executeSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModalidade, activeUf, activeStatus]);

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
    if (e.key === 'Enter') {
      applyFilters();
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

            <nav className="hidden lg:flex items-center gap-1">
              <NavItem icon={Zap} label="Dashboard" />
              <NavItem icon={Bell} label="Notificações" badge={3} />
              <NavItem icon={Settings} label="Configurações" />
            </nav>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all" aria-label="Notificações">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all" aria-label="Usuário">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 border border-white/10 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                aria-label="Abrir menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/5 bg-[#0f1629]/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-2">
                <MobileNavItem icon={Zap} label="Dashboard" />
                <MobileNavItem icon={Bell} label="Notificações" badge={3} />
                <MobileNavItem icon={Settings} label="Configurações" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              <CustomSelect
                value={activeUf}
                onChange={setActiveUf}
                options={[
                  { value: 'Todas', label: 'Todos os Estados' },
                  ...UFS.filter((uf) => uf !== 'Todas').map((uf) => ({ value: uf, label: uf })),
                ]}
                placeholder="Todos os Estados"
                triggerClassName="min-w-[150px]"
              />

              <CustomSelect
                value={activeModalidade}
                onChange={setActiveModalidade}
                options={[
                  { value: '', label: 'Todas Modalidades' },
                  ...modalidades.map((mod) => ({ value: mod, label: mod })),
                ]}
                placeholder="Todas Modalidades"
                triggerClassName="min-w-[180px]"
              />

              <CustomSelect
                value={activeStatus}
                onChange={setActiveStatus}
                options={STATUS_OPTIONS.map((status) => ({ value: status, label: status === 'Todos' ? 'Todos Status' : status }))}
                placeholder="Todos Status"
                triggerClassName="min-w-[140px]"
              />

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
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all"
                        />
                        <span className="text-gray-500">até</span>
                        <input
                          type="date"
                          value={dataFinal}
                          onChange={(e) => setDataFinal(e.target.value)}
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all"
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
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all"
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
                        aria-label="Limpar filtros"
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
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                    aria-label="Limpar filtros"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Estado</label>
                  <CustomSelect
                    value={activeUf}
                    onChange={setActiveUf}
                    options={[
                      { value: 'Todas', label: 'Todos os Estados' },
                      ...UFS.filter((uf) => uf !== 'Todas').map((uf) => ({ value: uf, label: uf })),
                    ]}
                    placeholder="Todos os Estados"
                    triggerClassName="w-full"
                  />
                </div>

                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Data</label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dataInicial}
                      onChange={(e) => setDataInicial(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all"
                    />
                    <input
                      type="date"
                      value={dataFinal}
                      onChange={(e) => setDataFinal(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Categoria</label>
                  <CustomSelect
                    value={filterCategoria}
                    onChange={setFilterCategoria}
                    options={[
                      { value: 'Todas as Categorias', label: 'Todas as Categorias' },
                      ...CATEGORIAS.map((cat) => ({ value: cat, label: cat })),
                    ]}
                    placeholder="Todas as Categorias"
                    triggerClassName="w-full"
                  />
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
                      >
                        <BiddingCard bidding={bidding} onSelect={setSelectedBidding} />
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
                  <CustomSelect
                    value="todos"
                    onChange={() => {}}
                    options={[
                      { value: 'todos', label: 'Todos os Órgãos' },
                      { value: 'recife', label: 'Prefeitura do Recife' },
                      { value: 'federal', label: 'Governo Federal' },
                      { value: 'sp', label: 'Estado de São Paulo' },
                    ]}
                    placeholder="Todos os Órgãos"
                    triggerClassName="w-full"
                  />
                </div>

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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-gray-400">R$ Reais</span>
                </div>

                <button className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  <span>Ver mais</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>

              <div className="rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Atualizações</h3>
                <div className="space-y-4">
                  <TimelineItem title="Construção de Escola Municipal..." time="11 horas atrás" active />
                  <TimelineItem title="Aquisição de Equipamentos..." time="28 horas atrás" />
                  <TimelineItem title="Prestação de Serviços de TI..." time="2 dias atrás" />
                  <TimelineItem title="Reforma do Prédio Público..." time="3 dias atrás" />
                </div>
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

      <BiddingModal bidding={selectedBidding} onClose={() => setSelectedBidding(null)} />
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
        aria-label="Página anterior"
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
        aria-label="Próxima página"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, badge }: { icon: React.ElementType; label: string; active?: boolean; badge?: number }) {
  return (
    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-cyan-400/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      <Icon size={18} />
      <span>{label}</span>
      {badge && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold">{badge}</span>
      )}
    </button>
  );
}

function MobileNavItem({ icon: Icon, label, active, badge }: { icon: React.ElementType; label: string; active?: boolean; badge?: number }) {
  return (
    <button className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${active ? 'bg-cyan-400/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      <Icon size={20} />
      <span>{label}</span>
      {badge && (
        <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold">{badge}</span>
      )}
    </button>
  );
}

function TimelineItem({ title, time, active }: { title: string; time: string; active?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${active ? 'bg-cyan-400' : 'bg-white/20'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
}
