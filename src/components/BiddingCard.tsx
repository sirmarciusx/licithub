/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, MapPin, Calendar, ExternalLink, Info, DollarSign, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Bidding } from '../types/bidding';

interface BiddingCardProps {
  bidding: Bidding;
  onSelect: (b: Bidding) => void;
}

export const BiddingCard: React.FC<BiddingCardProps> = ({ bidding, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-[80px,1fr,120px] py-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors cursor-pointer group px-2"
      onClick={() => onSelect(bidding)}
    >
      <span className="text-[12px] text-gray-400 font-bold uppercase tracking-tight">
        {bidding.openingDate.includes('/') ? bidding.openingDate.split('/')[0] + '/' + bidding.openingDate.split('/')[1] : 'Hoje'}
      </span>
      
      <div className="flex flex-col">
        <span className="font-extrabold text-base text-ink group-hover:text-accent transition-colors leading-tight truncate pr-4">
          {bidding.title}
        </span>
        <div className="flex gap-4 mt-0.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{bidding.portal}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{bidding.location}</span>
        </div>
      </div>

      <div className="text-right">
        <span className="font-black text-accent text-lg">
          {bidding.value ? `R$ ${Math.round(bidding.value / 1000)}k` : '---'}
        </span>
      </div>
    </motion.div>
  );
};
