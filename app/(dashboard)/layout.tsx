import type { ReactNode } from 'react';
import BottomNav from '../../components/BottomNav';

interface DashboardLayoutProps {
  readonly children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps): JSX.Element {
  return (
    <div className="pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
