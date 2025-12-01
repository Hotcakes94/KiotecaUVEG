import React, { useState } from 'react';
import { ThemeOption } from '../types';

interface HeaderProps {
  theme: ThemeOption;
}

export const Header: React.FC<HeaderProps> = ({ theme }) => {
  
  const getHeaderStyle = () => {
    switch(theme) {
      case 'dark': return 'bg-gray-800 border-gray-700 text-white';
      case 'pink': return 'bg-pink-100 border-pink-200 text-pink-900';
      case 'emerald': return 'bg-emerald-100 border-emerald-200 text-emerald-900';
      default: return 'bg-white border-gray-200 text-gray-800'; // light
    }
  };

  const getInputStyle = () => {
    switch(theme) {
      case 'dark': return 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500';
      case 'pink': return 'bg-white border-pink-300 text-pink-900 placeholder-pink-400 focus:ring-pink-500';
      case 'emerald': return 'bg-white border-emerald-300 text-emerald-900 placeholder-emerald-400 focus:ring-emerald-500';
      default: return 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-purple-500';
    }
  };

  return (
    <header className={`shadow-sm sticky top-0 z-50 border-b transition-colors duration-300 ${getHeaderStyle()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Kioteca <span className={theme === 'emerald' ? 'text-emerald-600' : theme === 'pink' ? 'text-pink-500' : 'text-purple-700'}>UVEG</span>
          </h1>
        </div>
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${getInputStyle()}`}
            />
            <button className={`absolute right-0 top-0 h-full w-10 text-white rounded-r-lg transition-colors flex items-center justify-center ${theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-pink-600 hover:bg-pink-700'}`}>
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};