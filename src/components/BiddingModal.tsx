/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, ExternalLink, Loader2, Calendar, MapPin, Building2, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Bidding } from '../types/bidding';
import { summarizeBidding } from '../services/api';

interface BiddingModalProps {
  bidding: Bidding | null;
  onClose: () => void;
}

export const BiddingModal: React.FC<BiddingModalProps> = ({ bidding, onClose }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (bidding) {
      handleSummarize();
    } else {
      setSummary('');
    }
  }, [bidding]);

  const handleSummarize = async () => {
    if (!bidding) return;
    setLoading(true);
    const result = await summarizeBidding(bidding);
    setSummary(result);
    setLoading(false);
  };

  if (!bidding) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="bg-white w-full max-w-2xl max-h-[95vh] overflow-hidden brutal-border flex flex-col shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)]"
        >
          {/* Header */}
          <div className="p-8 border-b-4 border-ink flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black px-2 py-0.5 bg-ink text-white uppercase tracking-widest">
                  {bidding.portal}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">#{bidding.id}</span>
              </div>
              <h2 className="text-4xl font-black text-ink leading-[0.9] tracking-tighter uppercase whitespace-pre-line">
                {bidding.title}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 border-2 border-ink hover:bg-ink hover:text-white transition-all text-ink mt-2"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-8 py-6 border-b border-gray-100">
              <div className="space-y-1">
                <span className="section-label mb-2">Localização</span>
                <div className="font-bold text-lg uppercase tracking-tight">{bidding.location}</div>
              </div>
              <div className="space-y-1">
                <span className="section-label mb-2">Valor Estimado</span>
                <div className="font-black text-2xl text-accent uppercase tracking-tighter">
                  {bidding.value ? `R$ ${bidding.value.toLocaleString('pt-BR')}` : 'Sob Consulta'}
                </div>
              </div>
            </div>

            <section className="bg-gray-100 p-8 border-l-[12px] border-accent">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles size={24} className="text-accent" />
                <h3 className="text-sm font-black text-ink uppercase tracking-[0.2em]">Resumo do Edital</h3>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                  <Loader2 size={40} className="animate-spin mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Análise em andamento...</p>
                </div>
              ) : (
                <div className="text-sm font-medium leading-relaxed whitespace-pre-line text-gray-800">
                  {summary}
                </div>
              )}
            </section>
            
            <section>
              <h3 className="section-label">Objeto Técnico</h3>
              <p className="font-medium text-gray-600 leading-relaxed border-l-2 border-gray-200 pl-6">
                {bidding.description}
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="p-8 border-t-4 border-ink flex">
            <a 
              href={bidding.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-3 bg-ink text-white py-6 text-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(37,99,235,0.4)]"
            >
              Ver Edital
              <ExternalLink size={24} />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
