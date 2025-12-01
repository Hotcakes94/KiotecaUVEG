import React from 'react';

interface MobileNavbarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ activeView, onNavigate }) => {
  const items = [
    { id: 'home', icon: 'fas fa-home', label: 'Inicio' },
    { id: 'groups', icon: 'fas fa-users', label: 'Grupos' },
    { id: 'profile', icon: 'fas fa-user', label: 'Perfil' },
    { id: 'notifications', icon: 'fas fa-bell', label: 'Avisos' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around items-center pb-safe pt-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex flex-col items-center p-2 w-full transition-all active-scale ${
            activeView === item.id ? 'text-purple-600 scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className={`relative ${activeView === item.id ? 'mb-1' : 'mb-1'}`}>
              <i className={`${item.icon} text-xl`}></i>
              {activeView === item.id && (
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></span>
              )}
          </div>
          <span className={`text-[10px] font-medium ${activeView === item.id ? 'font-bold' : ''}`}>{item.label}</span>
        </button>
      ))}
    </div>
  );
};