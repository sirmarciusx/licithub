/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ExternalLink, Building2, MapPin, Calendar, DollarSign, FileText, Link2, CheckCircle2, Clock, XCircle, AlertCircle, BookmarkPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Bidding } from '../types/bidding';

interface BiddingModalProps {
  bidding: Bidding | null;
  onClose: () => void;
}

const STATUS_CONFIG = {
  Aberto: { bg: 'rgba(16,185,129,0.1)', text: '#34d399', border: 'rgba(16,185,129,0.3)', icon: CheckCircle2 },
  Encerrado: { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.3)', icon: XCircle },
  Suspenso: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)', icon: AlertCircle },
  'Em Andamento': { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)', icon: Clock },
  Divulgada: { bg: 'rgba(139,92,246,0.1)', text: '#a78bfa', border: 'rgba(139,92,246,0.3)', icon: AlertCircle },
  Publicada: { bg: 'rgba(6,182,212,0.1)', text: '#22d3ee', border: 'rgba(6,182,212,0.3)', icon: CheckCircle2 },
};

const DEFAULT_STATUS = { bg: 'rgba(255,255,255,0.05)', text: '#94a3b8', border: 'rgba(255,255,255,0.1)', icon: AlertCircle };

function formatCurrency(value?: number | string): string {
  if (!value) return 'Sob consulta';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'Sob consulta';
  return `R$ ${num.toLocaleString('pt-BR')}`;
}

export const BiddingModal: React.FC<BiddingModalProps> = ({ bidding, onClose }) => {
  if (!bidding) return null;

  const statusConfig = (bidding?.status && STATUS_CONFIG[bidding.status as keyof typeof STATUS_CONFIG]) || DEFAULT_STATUS;
  const StatusIcon = statusConfig.icon || AlertCircle;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-white/10 overflow-hidden flex flex-col"
          style={{
            backgroundColor: 'rgba(15,22,41,0.95)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}
        >
          <div
            className="px-6 py-5 flex justify-between items-start gap-4 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(90deg, #0f1629, #0a0e27)' }}
          >
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-slate-400">
                  {bidding.portal || 'PNCP'}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  style={{
                    borderColor: statusConfig.border,
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.text,
                  }}
                >
                  <StatusIcon size={12} />
                  {bidding.status || 'Não informada'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white leading-snug tracking-tight">
                {bidding.title || 'Sem título'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Fechar"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar text-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoBlock icon={Building2} label="Órgão">
                <p className="font-medium text-white">{bidding.nomeOrgao || 'Não informado'}</p>
                {bidding.cnpjOrgao && (
                  <p className="text-xs mt-1 text-slate-500">CNPJ: {bidding.cnpjOrgao}</p>
                )}
              </InfoBlock>

              <InfoBlock icon={MapPin} label="Localização">
                <p className="font-medium text-white">{bidding.municipio || bidding.location || 'Não informado'}</p>
                {bidding.uf && (
                  <p className="text-xs mt-1 text-slate-500">UF: {bidding.uf}</p>
                )}
              </InfoBlock>

              <InfoBlock icon={FileText} label="Modalidade">
                <p className="font-medium text-white">{bidding.modalidade || bidding.category || 'Não informada'}</p>
              </InfoBlock>

              <div className="rounded-xl p-4 border bg-gradient-to-br from-cyan-400/10 to-blue-600/10 border-cyan-400/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-cyan-400" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor Estimado</span>
                </div>
                <p className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                  {formatCurrency(bidding.valorEstimado || bidding.value)}
                </p>
              </div>
            </div>

            {(bidding.dataPublicacao || bidding.dataAberturaProposta || bidding.dataEncerramentoProposta) && (
              <div className="rounded-xl p-4 border border-white/10 bg-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-cyan-400" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Datas Importantes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {bidding.dataPublicacao && (
                    <DateBlock label="Publicação" value={bidding.dataPublicacao} />
                  )}
                  {bidding.dataAberturaProposta && (
                    <DateBlock label="Abertura" value={bidding.dataAberturaProposta} />
                  )}
                  {bidding.dataEncerramentoProposta && (
                    <DateBlock label="Encerramento" value={bidding.dataEncerramentoProposta} />
                  )}
                </div>
              </div>
            )}

            {bidding.description && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileText size={16} className="text-cyan-400" />
                  Objeto Técnico
                </h3>
                <p className="text-sm leading-relaxed rounded-xl p-4 border border-white/10 bg-white/5 text-slate-400">
                  {bidding.description}
                </p>
              </div>
            )}

            {bidding.linkOrigem && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Link2 size={16} className="text-cyan-400" />
                  Link de Origem
                </h3>
                <a
                  href={bidding.linkOrigem}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm transition-colors break-all text-cyan-400 hover:text-cyan-300"
                >
                  {bidding.linkOrigem}
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>

          <div className="px-6 py-4 flex gap-3 shrink-0 border-t border-white/10 bg-[#0f1629]/50">
            <a
              href={bidding.sourceUrl || bidding.linkOrigem}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.98] bg-gradient-to-r from-cyan-400 to-blue-600 hover:shadow-lg hover:shadow-cyan-400/25"
            >
              <span>Ver Detalhes</span>
              <ExternalLink size={18} />
            </a>
            <button className="px-4 py-3.5 rounded-xl border border-white/20 text-white/80 transition-all hover:bg-white/10 flex items-center justify-center" aria-label="Acompanhar">
              <BookmarkPlus size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

function InfoBlock({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 border border-white/10 bg-white/5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-cyan-400" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  );
}

function DateBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      <p className="font-medium text-white">{value}</p>
    </div>
  );
}
