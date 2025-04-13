import { FC, ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useTheme } from "@/contexts/ThemeContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Regular sidebar for desktop */}
      <Sidebar />
      
      {/* Mobile sidebar (conditionally rendered) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={toggleSidebar}
          ></div>
          <div className="absolute left-0 top-0 h-full w-64 z-10">
            <Sidebar />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export { MainLayout };
export default MainLayout;
