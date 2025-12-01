import React, { useState } from 'react';
import { PostType } from '../types';

interface CreatePostProps {
  onPostCreate: (type: PostType, content: string, extraData?: any) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreate }) => {
  const [activeTab, setActiveTab] = useState<PostType>(PostType.QUESTION);
  const [content, setContent] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [achievementImage, setAchievementImage] = useState<File | null>(null);

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;

    let extraData = {};
    if (activeTab === PostType.POLL) {
      // Filter out empty options
      const validOptions = pollOptions.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) return; // Need at least 2 options
      extraData = { pollOptions: validOptions };
    } else if (activeTab === PostType.ACHIEVEMENT) {
        // In a real app, upload image here. We'll use a placeholder if an image is selected.
        if (achievementImage) {
            extraData = { hasImage: true };
        }
    }

    onPostCreate(activeTab, content, extraData);
    
    // Reset form
    setContent('');
    setPollOptions(['', '']);
    setAchievementImage(null);
  };

  const tabs = [
    { type: PostType.QUESTION, label: 'Pregunta', color: 'bg-purple-700', activeColor: 'bg-purple-700', hoverColor: 'hover:bg-purple-800' },
    { type: PostType.POLL, label: 'Encuesta', color: 'bg-teal-500', activeColor: 'bg-teal-500', hoverColor: 'hover:bg-teal-600' },
    { type: PostType.ACHIEVEMENT, label: 'Logros', color: 'bg-yellow-600', activeColor: 'bg-yellow-600', hoverColor: 'hover:bg-yellow-700' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`px-6 py-3 text-sm font-medium text-white transition-colors flex-1 sm:flex-none ${
              activeTab === tab.type ? tab.activeColor : `${tab.color} opacity-70 hover:opacity-100`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            activeTab === PostType.QUESTION ? "¿Cual es tu duda?..." :
            activeTab === PostType.POLL ? "Titulo de tu encuesta..." :
            "Comparte tu logro..."
          }
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 resize-none h-24 text-gray-700"
        />

        {/* Poll Options */}
        {activeTab === PostType.POLL && (
          <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 font-medium">Opciones de la encuesta:</span>
                <button 
                    onClick={addPollOption}
                    className="text-xs text-teal-600 font-bold hover:underline flex items-center"
                >
                    <i className="fas fa-plus mr-1"></i> Agregar Opción
                </button>
            </div>
            {pollOptions.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => handlePollOptionChange(index, e.target.value)}
                placeholder={`Opción ${index + 1}`}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-teal-500 text-sm"
              />
            ))}
          </div>
        )}

        {/* Achievement Image Input */}
        {activeTab === PostType.ACHIEVEMENT && (
           <div className="mt-3">
               <label className="block text-sm font-medium text-gray-700 mb-1">Foto del logro (Opcional)</label>
               <div className="flex items-center space-x-2">
                   <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm transition-colors border border-gray-200 flex items-center">
                       <i className="fas fa-camera mr-2"></i> Subir Imagen
                       <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => setAchievementImage(e.target.files?.[0] || null)}
                       />
                   </label>
                   {achievementImage && <span className="text-xs text-green-600 font-medium">{achievementImage.name}</span>}
               </div>
           </div>
        )}

        {/* Footer Actions */}
        <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
          <button
            onClick={handleSubmit}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
          >
            Publicar {activeTab === PostType.POLL ? 'Encuesta' : activeTab === PostType.QUESTION ? 'Pregunta' : 'Logro'}
          </button>
        </div>
      </div>
    </div>
  );
};