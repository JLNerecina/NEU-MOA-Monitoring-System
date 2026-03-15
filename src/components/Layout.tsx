import React from 'react';
import { cn } from '../lib/utils';

export const Layout: React.FC<{ children: React.ReactNode, theme: 'light' | 'dark' }> = ({ children, theme }) => {
  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-blue-500/30 transition-colors duration-300",
      theme === 'dark' ? "bg-[#0f0c29] text-white dark" : "bg-slate-50 text-slate-900"
    )}>
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={cn(
          "absolute -top-[10%] -left-[10%] w-[400px] h-[400px] blur-[100px] rounded-full animate-pulse",
          theme === 'dark' ? "bg-purple-600/20" : "bg-purple-400/10"
        )} />
        <div className={cn(
          "absolute -bottom-[5%] -right-[5%] w-[350px] h-[350px] blur-[100px] rounded-full animate-pulse delay-700",
          theme === 'dark' ? "bg-blue-500/15" : "bg-blue-300/10"
        )} />
        <div className={cn(
          "absolute top-[40%] right-[15%] w-[300px] h-[300px] blur-[100px] rounded-full animate-pulse delay-1000",
          theme === 'dark' ? "bg-blue-600/10" : "bg-blue-400/5"
        )} />
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const GlassCard: React.FC<{ children: React.ReactNode, className?: string, theme?: 'light' | 'dark' }> = ({ children, className, theme = 'dark' }) => (
  <div className={cn(
    "backdrop-blur-xl border rounded-3xl shadow-2xl transition-all duration-300",
    theme === 'dark' 
      ? "bg-white/5 border-white/10" 
      : "bg-white/70 border-slate-200 shadow-slate-200/50",
    className
  )}>
    {children}
  </div>
);
