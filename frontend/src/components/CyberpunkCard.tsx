import type { ReactNode } from 'react';

interface CyberpunkCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'purple' | 'orange' | 'green' | 'red' | 'blue' | 'yellow';
  variant?: 'default' | 'glass' | 'solid';
}

export default function CyberpunkCard({ 
  children, 
  className = '', 
  glowColor = 'cyan',
  variant = 'default'
}: CyberpunkCardProps) {
  const glowColors = {
    cyan: 'shadow-cyan-500/20 border-cyan-500/30 hover:border-cyan-500/50',
    purple: 'shadow-purple-500/20 border-purple-500/30 hover:border-purple-500/50',
    orange: 'shadow-orange-500/20 border-orange-500/30 hover:border-orange-500/50',
    green: 'shadow-green-500/20 border-green-500/30 hover:border-green-500/50',
    red: 'shadow-red-500/20 border-red-500/30 hover:border-red-500/50',
    blue: 'shadow-blue-500/20 border-blue-500/30 hover:border-blue-500/50',
    yellow: 'shadow-yellow-500/20 border-yellow-500/30 hover:border-yellow-500/50',
  };

  const variants = {
    default: 'bg-gray-900/80 backdrop-blur-sm',
    glass: 'bg-gray-900/40 backdrop-blur-md',
    solid: 'bg-gray-900',
  };

  return (
    <div 
      className={`
        relative rounded-lg border-2 p-6 
        transition-all duration-300 
        ${glowColors[glowColor]} 
        ${variants[variant]}
        ${className}
        group
      `}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
      
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scan" />
      </div>
      
      {children}
    </div>
  );
}