import { Sidebar } from './Sidebar';
import { ToastContainer } from './Toast';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-bg">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}
