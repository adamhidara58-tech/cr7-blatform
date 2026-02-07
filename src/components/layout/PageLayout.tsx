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
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-gradient-to-b from-gold/5 to-transparent opacity-50" />
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-gold/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-gold/5 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-lg min-h-screen bg-[#050505] relative z-10 flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]">
        {showHeader && <Header />}
        <main className="flex-1 pb-28 pt-4">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
};
