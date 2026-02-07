import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export const PageLayout = ({ children, showHeader = true }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Background decoration for large screens */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-20 hidden lg:block">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-lg min-h-screen bg-background relative z-10 shadow-2xl lg:border-x lg:border-white/5 flex flex-col">
        {showHeader && <Header />}
        <main className="flex-1 pb-24 pt-2">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
};
