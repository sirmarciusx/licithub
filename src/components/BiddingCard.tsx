/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Building2, AlertCircle, CheckCircle2, Clock, XCircle, Search, Eye, BookmarkPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { Bidding } from '../types/bidding';

interface BiddingCardProps {
  bidding: Bidding;
  onSelect: (b: Bidding) => void;
}

const STATUS_CONFIG = {
  Aberto: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: CheckCircle2, label: 'Aberta' },
  Encerrado: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: XCircle, label: 'Encerrada' },
  Suspenso: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: AlertCircle, label: 'Suspenso' },
  'Em Andamento': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', icon: Clock, label: 'Em Andamento' },
  Divulgada: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', icon: AlertCircle, label: 'Divulgada' },
  Publicada: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', icon: CheckCircle2, label: 'Publicada' },
};

const DEFAULT_STATUS = { bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/10', icon: AlertCircle, label: 'Não definida' };

function formatCurrency(value?: number | string): string {
  if (!value) return 'Sob consulta';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'Sob consulta';

  if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `R$ ${(num / 1000).toFixed(0)}k`;
  return `R$ ${num.toLocaleString('pt-BR')}`;
}

function formatDate(dateStr: string): { day: string; month: string; full: string } {
  if (!dateStr) return { day: '--', month: '--', full: '' };

  const formats = [
    /^(\d{2})\/(\d{2})\/(\d{4})/,
    /^(\d{4})-(\d{2})-(\d{2})/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) {
        return { day: match[1], month: match[2], full: dateStr };
      }
      return { day: match[3], month: match[2], full: dateStr };
    }
  }

  return { day: '--', month: '--', full: dateStr };
}

function getDaysRemaining(dateStr: string): number {
  if (!dateStr) return 0;

  try {
    const parts = dateStr.includes('/') ? dateStr.split('/') : null;
    const targetDate = parts ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : new Date(dateStr);
    const today = new Date();
    const diff = targetDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export const BiddingCard: React.FC<BiddingCardProps> = ({ bidding, onSelect }) => {
  const statusConfig = (bidding?.status && STATUS_CONFIG[bidding.status as keyof typeof STATUS_CONFIG]) || DEFAULT_STATUS;
  const StatusIcon = statusConfig.icon || AlertCircle;
  const { day, month } = formatDate(bidding?.openingDate || '');
  const daysRemaining = getDaysRemaining(bidding?.openingDate || '');
  const safeDaysRemaining = isNaN(daysRemaining) ? 0 : daysRemaining;
  const progressPercent = Math.min(100, Math.max(0, (safeDaysRemaining / 30) * 100));

  if (!bidding) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => onSelect(bidding)}
      className="rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl cursor-pointer transition-all duration-300 hover:bg-white/8 hover:border-white/15 hover:-translate-y-1"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-cyan-400/30 bg-gradient-to-br from-cyan-400/20 to-blue-600/20">
          <Search size={18} className="text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white leading-snug line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {bidding.title || 'Sem título'}
          </h3>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-4">
        {bidding.nomeOrgao && (
          <div className="flex items-center gap-1.5 text-gray-400">
            <Building2 size={14} className="text-gray-500" />
            <span className="truncate max-w-[140px]">Órgão: {bidding.nomeOrgao}</span>
          </div>
        )}
        {bidding.modalidade && (
          <div className="text-xs px-2 py-0.5 rounded border border-white/10 bg-white/5 text-slate-400">
            {bidding.modalidade}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-500" />
          <span className="text-sm text-gray-400">
            Prazo: <span className="text-white font-medium">{day} {month}</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            {formatCurrency(bidding.valorEstimado || bidding.value)}
          </span>
        </div>
      </div>

      {bidding.description && (
        <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {bidding.description}
        </p>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">Prazo Restante:</span>
          <span className="text-xs font-medium text-cyan-400">{safeDaysRemaining > 0 ? `${safeDaysRemaining} dias` : 'Vencido'}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-400 to-blue-600"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-cyan-400/30 bg-cyan-400/10 text-cyan-400">
          Novidade
        </span>
        {bidding.valorEstimado && bidding.valorEstimado > 1000000 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-amber-500/30 bg-amber-500/10 text-amber-400">
            Alta Prioridade
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm text-white transition-all hover:shadow-lg active:scale-[0.98] bg-gradient-to-r from-cyan-400 to-blue-600">
          <Eye size={14} />
          <span>Ver Detalhes</span>
        </button>
        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm border border-white/20 text-white/80 transition-all hover:bg-white/10">
          <BookmarkPlus size={14} />
          <span>Acompanhar</span>
        </button>
      </div>
    </motion.div>
  );
};
