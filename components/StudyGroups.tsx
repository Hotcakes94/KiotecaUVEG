import React, { useState } from 'react';
import { StudyGroup, GroupResource, ResourceType, User } from '../types';

interface StudyGroupsProps {
  groups: StudyGroup[];
  currentUser: User;
  onJoinGroup: (groupId: string) => void;
  onAddResource: (groupId: string, resource: GroupResource) => void;
  onAskAI: (groupId: string, query: string) => Promise<void>;
  onCreateGroup: (data: { name: string, description: string, category: string }) => void;
}

export const StudyGroups: React.FC<StudyGroupsProps> = ({ 
  groups, 
  currentUser, 
  onJoinGroup, 
  onAddResource,
  onAskAI,
  onCreateGroup
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newResourceContent, setNewResourceContent] = useState('');
  const [newResourceType, setNewResourceType] = useState<ResourceType>(ResourceType.COMMENT);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // MODAL STATE
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCat, setNewGroupCat] = useState('Programación');

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  const handleBack = () => {
    setSelectedGroupId(null);
  };

  const handlePostResource = () => {
    if (!selectedGroupId || !newResourceContent.trim()) return;

    const newResource: GroupResource = {
      id: Date.now().toString(),
      type: newResourceType,
      content: newResourceContent,
      author: currentUser,
      timestamp: 'Ahora mismo',
      title: newResourceType === ResourceType.BOOK ? 'Recurso compartido' : undefined,
      url: newResourceType !== ResourceType.COMMENT ? '#' : undefined
    };

    onAddResource(selectedGroupId, newResource);
    setNewResourceContent('');
    setNewResourceType(ResourceType.COMMENT);
  };

  const handleAiConsult = async () => {
    if (!selectedGroupId || !newResourceContent.trim()) return;
    setIsAiLoading(true);
    await onAskAI(selectedGroupId, newResourceContent);
    setNewResourceContent('');
    setIsAiLoading(false);
  };

  const submitCreateGroup = () => {
      if (!newGroupName.trim() || !newGroupDesc.trim()) return;
      onCreateGroup({
          name: newGroupName,
          description: newGroupDesc,
          category: newGroupCat
      });
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
  };

  // --- VIEW: LIST OF GROUPS ---
  if (!selectedGroup) {
    const myGroups = groups.filter(g => g.isMember);
    const otherGroups = groups.filter(g => !g.isMember);

    return (
      <div className="space-y-8 animate-fade-in relative">
        {/* CREATE GROUP MODAL OVERLAY */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Grupo</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo</label>
                            <input 
                                type="text" 
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                placeholder="Ej: Algoritmos Avanzados"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select 
                                value={newGroupCat}
                                onChange={(e) => setNewGroupCat(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            >
                                <option>Programación</option>
                                <option>Matemáticas</option>
                                <option>Idiomas</option>
                                <option>Ingeniería</option>
                                <option>Derecho</option>
                                <option>Administración</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea 
                                value={newGroupDesc}
                                onChange={(e) => setNewGroupDesc(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none h-24 resize-none"
                                placeholder="¿De qué trata este grupo?"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button 
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >Cancelar</button>
                        <button 
                            onClick={submitCreateGroup}
                            disabled={!newGroupName.trim() || !newGroupDesc.trim()}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold shadow disabled:opacity-50"
                        >Crear Grupo</button>
                    </div>
                </div>
            </div>
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Grupos de Estudio</h2>
            <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm active-scale"
            >
                <i className="fas fa-plus mr-2"></i> Crear Grupo
            </button>
        </div>

        {/* My Groups Section */}
        {myGroups.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <i className="fas fa-user-friends mr-2 text-purple-500"></i> Mis Grupos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myGroups.map(group => (
                <div 
                    key={group.id} 
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`${group.color} p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all transform hover:-translate-y-1 relative overflow-hidden group`}
                >
                  <div className="relative z-10">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 bg-white bg-opacity-30 ${group.textColor}`}>
                        {group.category}
                    </span>
                    <h4 className={`text-xl font-bold mb-1 ${group.textColor}`}>{group.name}</h4>
                    <p className={`text-sm opacity-90 mb-4 ${group.textColor}`}>{group.description}</p>
                    <div className="flex items-center text-sm font-medium bg-white bg-opacity-20 w-max px-3 py-1 rounded-full text-white">
                        <i className="fas fa-users mr-2"></i> {group.membersCount} Miembros
                    </div>
                  </div>
                  <i className={`fas fa-book-reader absolute -bottom-4 -right-4 text-9xl opacity-10 ${group.textColor} group-hover:scale-110 transition-transform`}></i>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Explore Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
             <i className="fas fa-compass mr-2 text-teal-500"></i> Explorar Grupos
          </h3>
          {otherGroups.length === 0 ? (
               <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
                   <p className="text-gray-500">Ya eres miembro de todos los grupos disponibles.</p>
               </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherGroups.map(group => (
                <div key={group.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col justify-between hover:border-purple-200 transition-colors">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-gray-800">{group.name}</h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{group.category}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{group.description}</p>
                        <div className="text-xs text-gray-400 mb-4">
                            <i className="fas fa-users mr-1"></i> {group.membersCount} estudiantes unidos
                        </div>
                    </div>
                    <button 
                        onClick={() => onJoinGroup(group.id)}
                        className="w-full py-2 border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors text-sm active-scale"
                    >
                        Unirme al grupo
                    </button>
                </div>
                ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // --- VIEW: GROUP DETAIL ---
  return (
    <div className="bg-white rounded-xl shadow-sm min-h-[80vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className={`${selectedGroup.color} p-6 text-white`}>
            <button onClick={handleBack} className="mb-4 text-sm font-medium hover:underline flex items-center opacity-80 hover:opacity-100">
                <i className="fas fa-arrow-left mr-2"></i> Volver a Grupos
            </button>
            <h2 className="text-3xl font-bold">{selectedGroup.name}</h2>
            <p className="opacity-90 mt-1">{selectedGroup.description}</p>
        </div>

        {/* Resources / Chat Area */}
        <div className="flex-1 p-6 bg-gray-50 overflow-y-auto space-y-4">
             {selectedGroup.resources.length === 0 ? (
                 <div className="text-center py-12 text-gray-400">
                     <i className="fas fa-folder-open text-4xl mb-3"></i>
                     <p>Aún no hay recursos compartidos. ¡Sé el primero!</p>
                 </div>
             ) : (
                 selectedGroup.resources.map(res => (
                     <div key={res.id} className={`flex ${res.author.id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] ${res.type === ResourceType.AI_RESPONSE ? 'w-full' : ''}`}>
                             <div className={`rounded-xl p-4 shadow-sm ${
                                 res.type === ResourceType.AI_RESPONSE ? 'bg-indigo-50 border border-indigo-200' :
                                 res.author.id === currentUser.id ? 'bg-white rounded-tr-none' : 'bg-white rounded-tl-none'
                             }`}>
                                 {/* Author Header */}
                                 <div className="flex items-center justify-between mb-2">
                                     <div className="flex items-center space-x-2">
                                         {res.type === ResourceType.AI_RESPONSE ? (
                                             <div className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded font-bold">Kioteca IA</div>
                                         ) : (
                                             <span className="text-xs font-bold text-gray-600">{res.author.name}</span>
                                         )}
                                         <span className="text-[10px] text-gray-400">{res.timestamp}</span>
                                     </div>
                                     {/* Icon based on Type */}
                                     {res.type === ResourceType.VIDEO && <i className="fas fa-video text-red-500"></i>}
                                     {res.type === ResourceType.BOOK && <i className="fas fa-book-open text-blue-500"></i>}
                                     {res.type === ResourceType.LINK && <i className="fas fa-link text-green-500"></i>}
                                 </div>

                                 {/* Content */}
                                 {res.title && <h5 className="font-bold text-gray-800 text-sm mb-1">{res.title}</h5>}
                                 <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{res.content}</p>
                                 
                                 {/* Action for links */}
                                 {res.url && (
                                     <a href="#" className="block mt-2 text-xs text-blue-600 hover:underline">
                                         Ver recurso <i className="fas fa-external-link-alt ml-1"></i>
                                     </a>
                                 )}
                             </div>
                         </div>
                     </div>
                 ))
             )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex space-x-2 mb-2">
                <button 
                    onClick={() => setNewResourceType(ResourceType.COMMENT)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${newResourceType === ResourceType.COMMENT ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                >Comentario</button>
                <button 
                    onClick={() => setNewResourceType(ResourceType.LINK)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${newResourceType === ResourceType.LINK ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
                ><i className="fas fa-link mr-1"></i> Link</button>
                <button 
                    onClick={() => setNewResourceType(ResourceType.BOOK)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${newResourceType === ResourceType.BOOK ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                ><i className="fas fa-book mr-1"></i> Libro/PDF</button>
            </div>
            
            <div className="relative">
                <textarea
                    value={newResourceContent}
                    onChange={(e) => setNewResourceContent(e.target.value)}
                    placeholder={
                        newResourceType === ResourceType.COMMENT ? "Escribe un mensaje o duda..." :
                        "Pega el enlace o describe el recurso..."
                    }
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none h-20 text-sm"
                />
                
                <div className="absolute bottom-2 right-2 flex space-x-2">
                    {/* AI BUTTON */}
                    <button 
                        onClick={handleAiConsult}
                        disabled={isAiLoading || !newResourceContent.trim()}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isAiLoading ? 'bg-indigo-300 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                        }`}
                        title="Consultar a la IA sobre este tema"
                    >
                        {isAiLoading ? <i className="fas fa-spinner fa-spin text-xs"></i> : <i className="fas fa-robot text-xs"></i>}
                    </button>

                    {/* SEND BUTTON */}
                    <button 
                        onClick={handlePostResource}
                        className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-md"
                    >
                        <i className="fas fa-paper-plane text-xs"></i>
                    </button>
                </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 ml-1">
                <i className="fas fa-info-circle mr-1"></i> 
                Usa el botón del robot <i className="fas fa-robot text-indigo-400"></i> para que la IA responda tu duda basándose en el tema del grupo.
            </p>
        </div>
    </div>
  );
};