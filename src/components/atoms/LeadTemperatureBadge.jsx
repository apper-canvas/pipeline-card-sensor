import React from 'react';
import { cn } from '@/utils/cn';

function LeadTemperatureBadge({ status, className }) {
  const getTemperatureStyle = (status) => {
    switch (status) {
      case 'hot':
        return {
          emoji: '🔥',
          label: 'Hot',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'warm':
        return {
          emoji: '🌡️',
          label: 'Warm', 
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'cold':
        return {
          emoji: '❄️',
          label: 'Cold',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'qualified':
        return {
          emoji: '✅',
          label: 'Qualified',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'new':
        return {
          emoji: '✨',
          label: 'New',
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      default:
        return {
          emoji: '⭕',
          label: status || 'Unknown',
          className: 'bg-slate-100 text-slate-800 border-slate-200'
        };
    }
  };

  const temp = getTemperatureStyle(status);

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
      temp.className,
      className
    )}>
      <span>{temp.emoji}</span>
      <span>{temp.label}</span>
    </span>
  );
}

export default LeadTemperatureBadge;