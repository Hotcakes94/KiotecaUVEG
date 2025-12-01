import React, { useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert';
}

interface NotificationToastProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col space-y-3 w-full max-w-sm pointer-events-none px-4 sm:px-0">
      {notifications.map((note) => (
        <div 
          key={note.id}
          className="pointer-events-auto bg-white rounded-lg shadow-lg border-l-4 border-purple-600 p-4 transform transition-all duration-300 animate-slide-in-right flex items-start"
        >
            <div className="flex-shrink-0 mr-3">
                {note.type === 'info' && <i className="fas fa-info-circle text-purple-600 text-xl"></i>}
                {note.type === 'success' && <i className="fas fa-check-circle text-green-500 text-xl"></i>}
                {note.type === 'alert' && <i className="fas fa-bell text-pink-500 text-xl"></i>}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm">{note.title}</h4>
                <p className="text-sm text-gray-600">{note.message}</p>
            </div>
            <button 
                onClick={() => onClose(note.id)}
                className="ml-3 text-gray-400 hover:text-gray-600"
            >
                <i className="fas fa-times"></i>
            </button>
        </div>
      ))}
    </div>
  );
};