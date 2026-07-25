import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
}

export default function Logo({ className = '', size = 'md', withText = true }: LogoProps) {
  const imgSizes = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12 md:w-14 md:h-14',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
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
    <div className={`flex items-center gap-2 group/logo ${className}`}>
      <img 
        src="/logo-transparent.png" 
        alt="Amankan Fraud Logo" 
        className={`${imgSizes[size]} object-contain group-hover/logo:scale-105 transition-transform duration-500`}
      />
      
      {withText && (
        <div className="flex flex-col">
          <span className={`${titleSizes[size]} font-black text-white tracking-tighter leading-none group-hover/logo:text-primary-blue transition-colors duration-300`}>
            Amankan Fraud
          </span>
          <span className={`${subtitleSizes[size]} font-bold text-primary-blue tracking-[0.3em] uppercase opacity-80 mt-1`}>
            Fraud Guard
          </span>
        </div>
      )}
    </div>
  );
}
