import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
}

export default function Logo({ className = '', size = 'md', withText = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const containerSizes = {
    sm: 'w-8 h-8 rounded',
    md: 'w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-lg md:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subtitleSizes = {
    sm: 'text-[8px]',
    md: 'text-[9px] md:text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-[12px]',
  };

  return (
    <div className={`flex items-center gap-3 lg:gap-4 group/logo ${className}`}>
      <div 
        className={`${containerSizes[size]} bg-primary-blue flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover/logo:scale-105 transition-transform duration-500`}
      >
        <ShieldCheck className={`${iconSizes[size]} text-white stroke-[2.5]`} />
      </div>
      
      {withText && (
        <div className="flex flex-col">
          <span className={`${titleSizes[size]} font-black text-white tracking-tighter leading-none group-hover/logo:text-primary-blue transition-colors duration-300`}>
            FraudGuard
          </span>
          <span className={`${subtitleSizes[size]} font-bold text-primary-blue tracking-[0.3em] uppercase opacity-80 mt-1`}>
            Cyber Intel
          </span>
        </div>
      )}
    </div>
  );
}
