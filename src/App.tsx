/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  Bell,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Bidding } from './types/bidding';
import { BiddingCard } from './components/BiddingCard';
import { BiddingModal } from './components/BiddingModal';
import { searchBiddings } from './services/api';

export default function App() {
  const [biddings, setBiddings] = useState<Bidding[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBidding, setSelectedBidding] = useState<Bidding | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todas');

  const categories = [
    'Todas', 'Obras Civis', 'Tecnologia', 'Saúde', 'Serviços Limpeza', 'Alimentos'
  ];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    const results = await searchBiddings(searchQuery, activeCategory);
    setBiddings(results);
    setLoading(false);
  };

  useEffect(() => {
    handleSearch();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans text-ink">
      
      {/* Header */}
      <header className="px-5 md:px-[60px] pt-8 md:pt-[40px] pb-5 md:pb-[20px] flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-end">
        <div className="text-2xl font-black tracking-[-1px] uppercase">LicitHub.Ag</div>
        <div className="text-[12px] font-bold uppercase tracking-wider">Acesso VIP: Ativo</div>
      </header>

      {/* Hero Section */}
      <section className="px-5 md:px-[60px] pb-[40px]">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl md:text-[88px] font-extrabold tracking-[-2px] md:tracking-[-4px] uppercase mb-8"
        >
          Busca Global<br />Licitações
        </motion.h1>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-5 max-w-4xl">
          <input 
            type="text"
            placeholder="O que você está procurando?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 brutal-border px-5 py-4 sm:px-8 sm:py-6 text-xl sm:text-2xl font-bold placeholder:text-gray-400 outline-none focus:bg-gray-50 transition-colors"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-ink text-white px-6 py-4 sm:px-10 sm:py-6 text-base sm:text-lg font-black uppercase tracking-wider hover:bg-zinc-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Buscando...' : 'Buscar Agora'}
          </button>
        </form>

        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`chip-brutal whitespace-nowrap ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 px-5 md:px-[60px] pb-[40px] grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-10">
        
        {/* Results Panel */}
        <div className="border-t-4 border-ink pt-5">
          <span className="section-label">Resultados Recentes ({biddings.length})</span>
          
          <div className="space-y-0 relative">
            {loading && biddings.length === 0 ? (
              <div className="py-20 flex flex-col items-center">
                <Loader2 className="animate-spin mb-4 text-accent" size={40} />
                <span className="font-bold uppercase tracking-wider text-xs">Conectando fontes...</span>
              </div>
            ) : biddings.length === 0 ? (
              <div className="py-20 border-2 border-dashed border-gray-200 text-center">
                <span className="font-bold text-gray-400 uppercase">Nenhum resultado disponível</span>
              </div>
            ) : (
              biddings.map(bidding => (
                <BiddingCard 
                  key={bidding.id} 
                  bidding={bidding} 
                  onSelect={setSelectedBidding} 
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="border-t-4 border-ink pt-5 space-y-10">
          <div>
            <span className="section-label">Inteligência de Mercado</span>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Oportunidades" value="42k" />
              <StatCard label="Fontes Ativas" value="12" />
              <StatCard label="Volume" value="R$ 4B" />
              <StatCard label="Análises" value="1.2k" />
            </div>
          </div>

          <div>
            <span className="section-label">Fontes Conectadas</span>
            <div className="space-y-2">
              <PlatformTag name="Portal de Compras" />
              <PlatformTag name="Licitações-e (BB)" />
              <PlatformTag name="BLL Compras" />
              <PlatformTag name="Comprasnet" />
              <PlatformTag name="SICONV" />
            </div>
          </div>
        </div>
      </main>

      <BiddingModal 
        bidding={selectedBidding} 
        onClose={() => setSelectedBidding(null)} 
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-gray-100 p-5">
      <span className="text-3xl font-black block mb-1">{value}</span>
      <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider font-mono">{label}</span>
    </div>
  );
}

function PlatformTag({ name }: { name: string }) {
  return (
    <div className="flex justify-between items-center py-1 font-bold text-sm border-b border-gray-100 pb-2">
      <span className="text-gray-800">{name}</span>
      <span className="text-accent text-[8px] leading-none">●</span>
    </div>
  );
}

