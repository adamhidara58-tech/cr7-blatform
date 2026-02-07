import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export const PageLayout = ({ children, showHeader = true }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center selection:bg-gold/30">
      {/* Optimized Background Effects - Lightweight */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-gradient-to-b from-gold/3 to-transparent opacity-40" />
        <div className="absolute top-1/4 -left-32 w-56 h-56 bg-gold/3 blur-[80px] rounded-full opacity-30" />
        <div className="absolute bottom-1/4 -right-32 w-56 h-56 bg-gold/3 blur-[80px] rounded-full opacity-30" />
      </div>

      <div className="w-full max-w-lg min-h-screen bg-[#050505] relative z-10 flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        {showHeader && <Header />}
        <main className="flex-1 pb-24 pt-2 px-0">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
};
