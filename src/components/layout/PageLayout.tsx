import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export const PageLayout = ({ children, showHeader = true }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <main className="pb-20 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};
