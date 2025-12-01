import React from 'react';
import { User, ThemeOption } from '../types';

interface SidebarProps {
  currentUser: User;
  activeView: string;
  onNavigate: (view: string) => void;
  currentTheme: ThemeOption;
  onThemeChange: (theme: ThemeOption) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentUser, 
  activeView, 
  onNavigate,
  currentTheme,
  onThemeChange
}) => {
  const menuItems = [
    { id: 'home', icon: 'fas fa-home', label: 'Inicio' },
    { id: 'groups', icon: 'fas fa-users', label: 'Grupos de Estudio' },
    { id: 'profile', icon: 'fas fa-user', label: 'Perfil' },
    { id: 'contacts', icon: 'fas fa-address-book', label: 'Contactos' },
  ];

  const getContainerStyle = () => {
    switch(currentTheme) {
      case 'dark': return 'bg-gray-800 text-white border-gray-700';
      case 'pink': return 'bg-pink-50 text-pink-900 border-pink-100';
      case 'emerald': return 'bg-emerald-50 text-emerald-900 border-emerald-100';
      default: return 'bg-white text-gray-800 border-gray-100';
    }
  };

  const getItemStyle = (isActive: boolean) => {
    if (isActive) {
        if (currentTheme === 'dark') return 'bg-gray-700 text-purple-400';
        if (currentTheme === 'pink') return 'bg-pink-200 text-pink-900';
        if (currentTheme === 'emerald') return 'bg-emerald-200 text-emerald-800';
        return 'bg-purple-50 text-purple-700';
    }
    // Inactive hover states
    if (currentTheme === 'dark') return 'text-gray-400 hover:bg-gray-700 hover:text-white';
    if (currentTheme === 'pink') return 'text-gray-600 hover:bg-pink-100 hover:text-pink-900';
    return 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  };

  return (
    <div className={`w-full md:w-64 flex-shrink-0 md:min-h-[calc(100vh-4rem)] p-6 shadow-sm hidden md:flex flex-col border-r transition-colors duration-300 ${getContainerStyle()}`}>
      <div className="flex flex-col items-center mb-8">
        <div className={`w-24 h-24 rounded-full overflow-hidden border-4 mb-3 ${currentTheme === 'dark' ? 'border-gray-600' : 'border-purple-100'}`}>
          <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-lg font-bold">{currentUser.name}</h2>
        <span className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Estudiante</span>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${getItemStyle(activeView === item.id)}`}
          >
            <i className={`${item.icon} w-6 text-center mr-3 text-lg`}></i>
            {item.label}
          </button>
        ))}
        
        <div className={`pt-4 mt-4 border-t ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
           <button className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-500 hover:bg-red-50 hover:bg-opacity-10 transition-colors">
            <i className="fas fa-power-off w-6 text-center mr-3 text-lg"></i>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* THEME SWITCHER SECTION */}
      <div className={`mt-6 pt-4 border-t ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <p className={`text-xs font-bold mb-3 uppercase tracking-wider ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Apariencia
          </p>
          <div className="flex justify-between px-2">
              <button 
                onClick={() => onThemeChange('light')}
                className={`w-8 h-8 rounded-full bg-gray-100 border-2 transition-transform hover:scale-110 ${currentTheme === 'light' ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-300'}`}
                title="Claro"
              ></button>
              <button 
                onClick={() => onThemeChange('dark')}
                className={`w-8 h-8 rounded-full bg-gray-900 border-2 transition-transform hover:scale-110 ${currentTheme === 'dark' ? 'border-purple-500 ring-2 ring-purple-900' : 'border-gray-600'}`}
                title="Oscuro"
              ></button>
              <button 
                onClick={() => onThemeChange('emerald')}
                className={`w-8 h-8 rounded-full bg-emerald-100 border-2 transition-transform hover:scale-110 ${currentTheme === 'emerald' ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-emerald-300'}`}
                title="Esmeralda"
              ></button>
              <button 
                onClick={() => onThemeChange('pink')}
                className={`w-8 h-8 rounded-full bg-pink-200 border-2 transition-transform hover:scale-110 ${currentTheme === 'pink' ? 'border-pink-500 ring-2 ring-pink-300' : 'border-pink-300'}`}
                title="Rosa"
              ></button>
          </div>
      </div>
    </div>
  );
};