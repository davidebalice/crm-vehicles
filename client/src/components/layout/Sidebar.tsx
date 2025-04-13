import { FC } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Car, Store, User, CalendarCheck,
  DollarSign, Wrench, Database, CreditCard, BarChart3,
  Settings, Banknote, Tags, Users, Sun, Moon, BookOpen,
  Globe, FileJson, Bell, Clock, Calendar, LogOut
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/use-auth";

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  currentPath: string;
};

const NavItem: FC<NavItemProps> = ({ href, icon, children, currentPath }) => {
  const isActive = currentPath === href || (href !== "/" && currentPath.startsWith(href));
  
  return (
    <Link href={href}>
      <div className={`flex items-center px-4 py-3 text-white hover:bg-primary-light ${isActive ? 'bg-primary-light' : ''} cursor-pointer`}>
        {icon}
        <span className="ml-3">{children}</span>
      </div>
    </Link>
  );
};

type NavExternalItemProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

const NavExternalItem: FC<NavExternalItemProps> = ({ href, icon, children }) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <div className="flex items-center px-4 py-3 text-white hover:bg-primary-light cursor-pointer">
        {icon}
        <span className="ml-3">{children}</span>
        <Globe className="w-3.5 h-3.5 ml-2 opacity-70" />
      </div>
    </a>
  );
};

type NavGroupProps = {
  title: string;
  children: React.ReactNode;
};

const NavGroup: FC<NavGroupProps> = ({ title, children }) => {
  return (
    <div className="py-2">
      <div className="px-4 py-2 text-sm text-neutral-300 uppercase tracking-wider">{title}</div>
      {children}
    </div>
  );
};

const Sidebar: FC = () => {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <aside className="hidden md:flex flex-col w-64 bg-primary text-white overflow-y-auto scrollbar-hide">
      <div className="p-4 flex items-center justify-between border-b border-primary-light">
        <div className="font-montserrat font-bold text-xl">AutoMoto Plus</div>
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-primary-light"
          aria-label="Cambia tema"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-white" />
          ) : (
            <Sun className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
      
      {user && (
        <div className="p-4 border-b border-primary-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white">
              <img src={user.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"} alt="Profile" className="h-8 w-8 rounded-full mr-2" />
              <div>
                <div className="font-medium">{user.fullName}</div>
                <div className="text-sm text-neutral-300">
                  {user.role === 'admin' ? 'Amministratore' : 'Utente'}
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="p-2 rounded-full hover:bg-primary-light text-white"
              aria-label="Logout"
              title="Disconnetti"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1">
        <nav className="mt-4">
          <NavItem href="/" icon={<LayoutDashboard className="w-5 h-5" />} currentPath={location}>
            Dashboard
          </NavItem>
          
          <NavItem href="/calendar" icon={<Calendar className="w-5 h-5" />} currentPath={location}>
            Calendario
          </NavItem>
          
          <NavGroup title="Veicoli">
            <NavItem href="/vehicles" icon={<Car className="w-5 h-5" />} currentPath={location}>
              Catalogo
            </NavItem>
            <NavItem href="/vehicles/manage" icon={<Store className="w-5 h-5" />} currentPath={location}>
              Aggiungi Veicolo
            </NavItem>
            <NavItem href="/vehicles/catalog-settings" icon={<Tags className="w-5 h-5" />} currentPath={location}>
              Marche e Modelli
            </NavItem>
          </NavGroup>
          
          <NavGroup title="Clienti e Vendite">
            <NavItem href="/customers" icon={<User className="w-5 h-5" />} currentPath={location}>
              Clienti
            </NavItem>
            <NavItem href="/appointments" icon={<CalendarCheck className="w-5 h-5" />} currentPath={location}>
              Prenotazioni
            </NavItem>
            <NavItem href="/sales" icon={<DollarSign className="w-5 h-5" />} currentPath={location}>
              Vendite
            </NavItem>
            <NavItem href="/reminders" icon={<Bell className="w-5 h-5" />} currentPath={location}>
              Promemoria
            </NavItem>
          </NavGroup>
          
          <NavGroup title="Officina">
            <NavItem href="/services" icon={<Wrench className="w-5 h-5" />} currentPath={location}>
              Interventi
            </NavItem>
            <NavItem href="/parts" icon={<Database className="w-5 h-5" />} currentPath={location}>
              Ricambi
            </NavItem>
          </NavGroup>
          
          <NavGroup title="Finanza">
            <NavItem href="/finance" icon={<CreditCard className="w-5 h-5" />} currentPath={location}>
              Transazioni
            </NavItem>
            <NavItem href="/finance/scheduled-transactions" icon={<Clock className="w-5 h-5" />} currentPath={location}>
              Transazioni Pianificate
            </NavItem>
            <NavItem href="/finance/financing" icon={<DollarSign className="w-5 h-5" />} currentPath={location}>
              Finanziamenti
            </NavItem>
          </NavGroup>
          
          <NavGroup title="Amministrazione">
            <NavItem href="/reports" icon={<BarChart3 className="w-5 h-5" />} currentPath={location}>
              Report
            </NavItem>
            <NavItem href="/admins" icon={<User className="w-5 h-5" />} currentPath={location}>
              Amministratori
            </NavItem>
            <NavItem href="/settings" icon={<Settings className="w-5 h-5" />} currentPath={location}>
              Impostazioni
            </NavItem>
          </NavGroup>
          
          <NavGroup title="Documentazione API">
            <NavItem href="/api-docs/it" icon={<BookOpen className="w-5 h-5" />} currentPath={location}>
              API Catalogo (IT)
            </NavItem>
            <NavItem href="/api-docs/en" icon={<BookOpen className="w-5 h-5" />} currentPath={location}>
              API Catalogo (EN)
            </NavItem>
            <NavExternalItem href="/api/catalog/export" icon={<FileJson className="w-5 h-5" />}>
              Esporta Catalogo
            </NavExternalItem>
          </NavGroup>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
