import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNavbar } from './components/MobileNavbar';
import { CreatePost } from './components/CreatePost';
import { PostCard } from './components/PostCard';
import { StudyGroups } from './components/StudyGroups';
import { NotificationToast, Notification } from './components/NotificationToast';
import { Post, PostType, User, Comment, StudyGroup, ResourceType, GroupResource, ThemeOption } from './types';
import { askKiotecaBot } from './services/ai';
import { socket } from './services/socket';

// --- USER MOCK DATA GENERATOR ---
const getUserFromParams = (): User => {
  const params = new URLSearchParams(window.location.search);
  const userParam = params.get('user')?.toLowerCase();

  if (userParam === 'ana') {
    return {
      id: 'u-ana',
      name: 'Ana García',
      avatar: 'https://picsum.photos/seed/ana/200/200',
      role: 'student'
    };
  } else if (userParam === 'bot') {
    return {
        id: 'bot-admin',
        name: 'Admin Bot',
        avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
        role: 'admin'
    };
  }

  // Default User (Luis)
  return {
    id: 'u1',
    name: 'Luis Hernandez',
    avatar: 'https://picsum.photos/seed/luis/200/200',
    role: 'student'
  };
};

const CURRENT_USER = getUserFromParams();

const BOT_USER: User = {
  id: 'bot-uveg',
  name: 'Kioteca Bot (IA)',
  avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png', // Robot icon
  role: 'admin',
  isBot: true
};

// Mock Data Posts
const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    type: PostType.QUESTION,
    author: { id: 'u2', name: 'Elisa Martinez', avatar: 'https://picsum.photos/seed/elisa/200/200' },
    content: '¿Cuando inicia el 3er modulo de Programación Web?',
    timestamp: 'Hace 2 horas',
    likes: 5,
    likedByCurrentUser: false,
    comments: [
      { id: 'c1', userId: 'u1', userName: 'Luis Hernandez', userAvatar: 'https://picsum.photos/seed/luis/200/200', content: 'En el portal viene la informacion, creo que el lunes.', timestamp: 'Hace 1 hora' },
      { id: 'c2', userId: 'u3', userName: 'Pepe Lopez', userAvatar: 'https://picsum.photos/seed/pepe/200/200', content: 'Tengo la misma duda', timestamp: 'Hace 30 min' }
    ]
  },
  {
    id: 'p2',
    type: PostType.POLL,
    author: { id: 'u4', name: 'Juan Perez', avatar: 'https://picsum.photos/seed/juan/200/200' },
    content: '¿Cual es la mejor carrera de la UVEG?',
    timestamp: 'Hace 5 horas',
    likes: 12,
    likedByCurrentUser: true,
    totalVotes: 40,
    hasVoted: false,
    pollOptions: [
      { id: 'o1', text: 'Educacion Innovadora', votes: 35 },
      { id: 'o2', text: 'Gestion Administrativa', votes: 4 },
      { id: 'o3', text: 'Ingenieria en Sistemas', votes: 1 },
      { id: 'o4', text: 'Ciencias Politicas', votes: 0 },
    ],
    comments: []
  }
];

// Mock Data Study Groups
const INITIAL_GROUPS: StudyGroup[] = [
    {
        id: 'g1',
        name: 'Matemáticas Discretas',
        description: 'Grupo para resolver dudas de lógica y conjuntos. ¡Todos son bienvenidos!',
        category: 'Ingeniería',
        color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
        textColor: 'text-white',
        membersCount: 156,
        isMember: true,
        resources: []
    },
    {
        id: 'g2',
        name: 'Club de ReactJS',
        description: 'Compartimos componentes, hooks y buenas prácticas para el desarrollo web.',
        category: 'Programación',
        color: 'bg-gradient-to-br from-indigo-600 to-purple-600',
        textColor: 'text-white',
        membersCount: 89,
        isMember: true,
        resources: []
    },
    // Added a non-member group so "Explore Groups" section appears
    {
        id: 'g3',
        name: 'English Conversation',
        description: 'Practice your english skills with us. Meeting every friday.',
        category: 'Idiomas',
        color: 'bg-gradient-to-br from-emerald-500 to-teal-500',
        textColor: 'text-white',
        membersCount: 340,
        isMember: false,
        resources: []
    }
];

export default function App() {
  const [currentView, setCurrentView] = useState('home'); 
  const [isTransitioning, setIsTransitioning] = useState(false); 
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [groups, setGroups] = useState<StudyGroup[]>(INITIAL_GROUPS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Theme State
  const [theme, setTheme] = useState<ThemeOption>('light');

  // New State for Filters
  const [postFilter, setPostFilter] = useState<'ALL' | PostType>('ALL');

  // --- VIEW NAVIGATION HANDLER ---
  const handleNavigate = (view: string) => {
    if (view === currentView) return;
    setIsTransitioning(true);
    setTimeout(() => {
        setCurrentView(view);
        setIsTransitioning(false);
        window.scrollTo(0, 0);
    }, 150);
  };

  // --- ONLINE/OFFLINE DETECTION ---
  useEffect(() => {
    const handleOnline = () => {
        setIsOnline(true);
        addNotification('Conexión restaurada', 'Estás en línea nuevamente.', 'success');
    };
    const handleOffline = () => {
        setIsOnline(false);
        addNotification('Modo Offline', 'No tienes internet. La app funcionará con datos guardados.', 'alert');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- SOCKET.IO REAL-TIME LISTENERS ---
  useEffect(() => {
    // Definimos las funciones con nombre para poder referenciarlas en .off()
    // Esto es CRUCIAL para evitar duplicados en React

    const handleNewPost = (newPost: Post) => {
      setPosts(prev => {
        // Protección contra duplicados: si ya existe el ID, no lo agregamos
        if (prev.some(p => p.id === newPost.id)) return prev;
        return [newPost, ...prev];
      });
      addNotification('Nueva Publicación', `${newPost.author.name} ha publicado algo nuevo.`, 'info');
    };

    const handleNewComment = ({ postId, comment }: { postId: string, comment: Comment }) => {
       setPosts(prev => prev.map(p => {
         if (p.id === postId) {
           // Evitar duplicados de comentarios
           if (p.comments.find(c => c.id === comment.id)) return p;
           return { ...p, comments: [...p.comments, comment] };
         }
         return p;
       }));
    };

    const handleNewLike = ({ postId, userId }: { postId: string, userId: string }) => {
      if (userId === CURRENT_USER.id) return; 
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, likes: p.likes + 1 };
        }
        return p;
      }));
    };

    const handleNewVote = ({ postId, optionId }: { postId: string, optionId: string }) => {
       setPosts(prev => prev.map(p => {
         if (p.id === postId && p.pollOptions) {
           return {
             ...p,
             totalVotes: (p.totalVotes || 0) + 1,
             pollOptions: p.pollOptions.map(opt => 
               opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
             )
           };
         }
         return p;
       }));
    };

    const handleNewGroup = (newGroup: StudyGroup) => {
        setGroups(prev => {
             // Protección contra duplicados
             if (prev.some(g => g.id === newGroup.id)) return prev;
             
             // CORRECCIÓN: Al recibir un grupo por socket, significa que OTRO usuario lo creó.
             // Por lo tanto, para el usuario actual (CURRENT_USER), isMember debe ser false.
             const groupForReceiver = { ...newGroup, isMember: false };
             
             return [...prev, groupForReceiver];
        });
        addNotification('Nuevo Grupo', `Se ha creado el grupo "${newGroup.name}".`, 'info');
    };

    const handleNewGroupResource = ({ groupId, resource }: { groupId: string, resource: GroupResource }) => {
       setGroups(prev => prev.map(g => {
           if (g.id === groupId) {
               // Evitar duplicados
               if (g.resources.some(r => r.id === resource.id)) return g;
               return { ...g, resources: [...g.resources, resource] };
           }
           return g;
       }));
    };

    // Suscribirse
    socket.on('post:new', handleNewPost);
    socket.on('post:comment', handleNewComment);
    socket.on('post:like', handleNewLike);
    socket.on('post:vote', handleNewVote);
    socket.on('group:new', handleNewGroup);
    socket.on('group:resource', handleNewGroupResource);

    // Limpieza (Cleanup) - Pasar la MISMA referencia de función
    return () => {
      socket.off('post:new', handleNewPost);
      socket.off('post:comment', handleNewComment);
      socket.off('post:like', handleNewLike);
      socket.off('post:vote', handleNewVote);
      socket.off('group:new', handleNewGroup);
      socket.off('group:resource', handleNewGroupResource);
    };
  }, []); // Dependencia vacía para correr solo al montar


  // --- NOTIFICATION SYSTEM ---
  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(); // Random ID better for fast bursts
    setNotifications(prev => [...prev, { id, title, message, type }]);
    
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };


  // --- POSTS LOGIC ---
  const addCommentToPost = (postId: string, comment: Comment) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, comment] };
      }
      return post;
    }));
  };

  const handlePostCreate = async (type: PostType, content: string, extraData: any) => {
    const newPostId = Date.now().toString();
    const newPost: Post = {
      id: newPostId,
      type,
      author: CURRENT_USER,
      content,
      timestamp: 'Justo ahora',
      likes: 0,
      likedByCurrentUser: false,
      comments: [],
      ...(type === PostType.POLL && {
        pollOptions: extraData.pollOptions.map((text: string, idx: number) => ({
            id: `opt-${idx}`,
            text,
            votes: 0
        })),
        totalVotes: 0,
        hasVoted: false
      }),
      ...(type === PostType.ACHIEVEMENT && {
          imageUrl: extraData.hasImage ? `https://picsum.photos/seed/${Date.now()}/800/400` : undefined
      })
    };
    
    // Add new post locally (use Functional Update to avoid stale state)
    setPosts(prev => [newPost, ...prev]);
    socket.emit('post:new', newPost);

    addNotification('Publicado con éxito', 'Tu publicación ya es visible para todos.', 'success');

    // AI Logic
    if (type === PostType.QUESTION) {
      if (!isOnline) {
          addNotification('IA no disponible', 'Conéctate a internet para recibir respuesta de la IA.', 'alert');
          return;
      }

      try {
        const aiResponse = await askKiotecaBot(content);
        const botComment: Comment = {
          id: `bot-${Date.now()}`,
          userId: BOT_USER.id,
          userName: BOT_USER.name,
          userAvatar: BOT_USER.avatar,
          isBot: true,
          content: aiResponse,
          timestamp: 'Ahora mismo'
        };
        addCommentToPost(newPostId, botComment);
        socket.emit('post:comment', { postId: newPostId, comment: botComment }); 
        addNotification('Kioteca Bot respondió', 'La IA ha respondido a tu duda.', 'info');
      } catch (error) {
        console.error("Bot failed to reply", error);
      }
    }
  };

  const handleVote = (postId: string, optionId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId && post.type === PostType.POLL && post.pollOptions) {
        return {
          ...post,
          hasVoted: true,
          totalVotes: (post.totalVotes || 0) + 1,
          pollOptions: post.pollOptions!.map(opt => 
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          )
        };
      }
      return post;
    }));
    socket.emit('post:vote', { postId, optionId });
    addNotification('Voto Registrado', 'Gracias por participar en la encuesta.', 'success');
  };

  const handleComment = (postId: string, text: string) => {
      const newComment: Comment = {
          id: Date.now().toString(),
          userId: CURRENT_USER.id,
          userName: CURRENT_USER.name,
          userAvatar: CURRENT_USER.avatar,
          content: text,
          timestamp: 'Justo ahora'
      };
      addCommentToPost(postId, newComment);
      socket.emit('post:comment', { postId, comment: newComment });
  };

  const handleLike = (postId: string) => {
      setPosts(prev => prev.map(post => {
          if (post.id === postId) {
              const newLikes = post.likedByCurrentUser ? post.likes - 1 : post.likes + 1;
              if (!post.likedByCurrentUser) {
                socket.emit('post:like', { postId, userId: CURRENT_USER.id });
              }
              return {
                  ...post,
                  likes: newLikes,
                  likedByCurrentUser: !post.likedByCurrentUser
              };
          }
          return post;
      }));
  }

  // --- GROUPS LOGIC ---
  const handleJoinGroup = (groupId: string) => {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, isMember: true } : g));
      addNotification('Grupo unido', 'Ahora eres miembro de este grupo de estudio.', 'success');
  };

  const handleCreateGroup = (groupData: { name: string, description: string, category: string }) => {
     const newGroup: StudyGroup = {
         id: `g-${Date.now()}`,
         name: groupData.name,
         description: groupData.description,
         category: groupData.category,
         color: 'bg-gradient-to-br from-pink-500 to-rose-500', 
         textColor: 'text-white',
         membersCount: 1,
         isMember: true,
         resources: []
     };
     setGroups(prev => [...prev, newGroup]);
     socket.emit('group:new', newGroup);
     addNotification('Grupo Creado', 'Tu grupo de estudio ha sido creado.', 'success');
  };

  const handleAddGroupResource = (groupId: string, resource: GroupResource) => {
      setGroups(prev => prev.map(g => {
          if (g.id === groupId) {
              return { ...g, resources: [...g.resources, resource] };
          }
          return g;
      }));
      
      // Emit socket event so others see the resource
      socket.emit('group:resource', { groupId, resource });
      
      if (resource.type !== ResourceType.AI_RESPONSE) {
         addNotification('Mensaje enviado', 'Tu mensaje ha sido enviado al grupo.', 'success');
      }
  };

  const handleGroupAIQuery = async (groupId: string, query: string) => {
      const userQuestionResource: GroupResource = {
          id: Date.now().toString(),
          type: ResourceType.COMMENT,
          content: `❓ Pregunta a la IA: ${query}`,
          author: CURRENT_USER,
          timestamp: 'Ahora mismo'
      };
      // Note: handleAddGroupResource now emits the socket event!
      handleAddGroupResource(groupId, userQuestionResource);

      if (!isOnline) {
          addNotification('Offline', 'La IA necesita internet para responder.', 'alert');
          return;
      }

      try {
          const group = groups.find(g => g.id === groupId);
          const contextPrompt = `Contexto: Estoy en un grupo de estudio sobre "${group?.name}". ${query}`;
          
          const aiResponseText = await askKiotecaBot(contextPrompt);

          const aiResource: GroupResource = {
              id: `bot-${Date.now()}`,
              type: ResourceType.AI_RESPONSE,
              content: aiResponseText,
              author: BOT_USER,
              timestamp: 'Ahora mismo'
          };
          
          // Emit bot response
          handleAddGroupResource(groupId, aiResource);
          
      } catch (e) {
          console.error(e);
      }
  };

  // --- FILTER LOGIC ---
  const filteredPosts = posts.filter(post => {
      if (postFilter === 'ALL') return true;
      return post.type === postFilter;
  });

  // --- THEME LOGIC ---
  const getThemeClasses = () => {
    switch(theme) {
      case 'dark': return 'bg-gray-900';
      case 'pink': return 'bg-pink-50';
      case 'emerald': return 'bg-emerald-50';
      default: return 'bg-gray-100'; // light
    }
  };


  return (
    <div className={`min-h-screen flex flex-col font-sans pb-16 md:pb-0 transition-colors duration-500 ${getThemeClasses()}`}>
      <Header theme={theme} />
      
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-red-500 text-white text-center py-2 text-sm font-bold shadow-md animate-pulse sticky top-16 z-40">
            <i className="fas fa-wifi-slash mr-2"></i> Modo Offline
        </div>
      )}

      {/* Toast Notifications Overlay */}
      <NotificationToast notifications={notifications} onClose={removeNotification} />

      <div className="flex-1 max-w-7xl w-full mx-auto md:px-6 lg:px-8 py-6 flex gap-6">
        <Sidebar 
            currentUser={CURRENT_USER} 
            activeView={currentView}
            onNavigate={handleNavigate}
            currentTheme={theme}
            onThemeChange={setTheme}
        />
        
        {/* Animated Main Content */}
        <main className={`flex-1 w-full max-w-3xl px-4 md:px-0 transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {currentView === 'home' && (
              <>
                <CreatePost onPostCreate={handlePostCreate} />
                
                {/* FILTER TABS */}
                <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    <button 
                        onClick={() => setPostFilter('ALL')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${postFilter === 'ALL' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-200'}`}
                    >Todas</button>
                    <button 
                        onClick={() => setPostFilter(PostType.QUESTION)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${postFilter === PostType.QUESTION ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-purple-50'}`}
                    >Solo Dudas</button>
                    <button 
                         onClick={() => setPostFilter(PostType.POLL)}
                         className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${postFilter === PostType.POLL ? 'bg-teal-500 text-white' : 'bg-white text-gray-600 hover:bg-teal-50'}`}
                    >Solo Encuestas</button>
                    <button 
                         onClick={() => setPostFilter(PostType.ACHIEVEMENT)}
                         className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${postFilter === PostType.ACHIEVEMENT ? 'bg-yellow-600 text-white' : 'bg-white text-gray-600 hover:bg-yellow-50'}`}
                    >Solo Logros</button>
                </div>

                <div className="space-y-6">
                    {filteredPosts.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <i className="fas fa-filter text-4xl mb-3"></i>
                            <p>No hay publicaciones con este filtro.</p>
                        </div>
                    ) : (
                        filteredPosts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            currentUser={CURRENT_USER}
                            onVote={handleVote}
                            onComment={handleComment}
                            onLike={handleLike}
                        />
                        ))
                    )}
                </div>
              </>
          )}

          {currentView === 'groups' && (
              <StudyGroups 
                groups={groups}
                currentUser={CURRENT_USER}
                onJoinGroup={handleJoinGroup}
                onAddResource={handleAddGroupResource}
                onAskAI={handleGroupAIQuery}
                onCreateGroup={handleCreateGroup}
              />
          )}

          {currentView !== 'home' && currentView !== 'groups' && (
              <div className="bg-white p-10 rounded-xl text-center text-gray-500 shadow-sm mt-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <i className="fas fa-tools text-4xl text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Sección en Construcción</h3>
                  <p>Estamos trabajando para traerte esta funcionalidad a tu móvil y escritorio pronto.</p>
              </div>
          )}
        </main>

        {/* Right column placeholder */}
        <div className="hidden lg:block w-72 flex-shrink-0 space-y-6">
             <div className="bg-white rounded-xl shadow-sm p-4">
                 <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Eventos Próximos</h3>
                 <div className="space-y-3">
                     <div className="flex items-start space-x-3">
                         <div className="bg-purple-100 text-purple-700 rounded-lg p-2 text-center w-12 flex-shrink-0">
                             <span className="block text-xs uppercase font-bold">OCT</span>
                             <span className="block text-lg font-bold">12</span>
                         </div>
                         <div>
                             <p className="text-sm font-medium text-gray-800">Cierre de inscripciones</p>
                             <p className="text-xs text-gray-500">Todo el día</p>
                         </div>
                     </div>
                     <div className="flex items-start space-x-3">
                         <div className="bg-teal-100 text-teal-700 rounded-lg p-2 text-center w-12 flex-shrink-0">
                             <span className="block text-xs uppercase font-bold">NOV</span>
                             <span className="block text-lg font-bold">05</span>
                         </div>
                         <div>
                             <p className="text-sm font-medium text-gray-800">Webinar de React</p>
                             <p className="text-xs text-gray-500">10:00 AM</p>
                         </div>
                     </div>
                 </div>
             </div>
             
             <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-xl shadow-md p-5 text-white">
                 <h3 className="font-bold text-lg mb-2">¿Necesitas Ayuda?</h3>
                 <p className="text-sm text-purple-100 mb-4">Contacta a tu tutor asignado para resolver dudas administrativas.</p>
                 <button className="w-full py-2 bg-white text-purple-800 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors active-scale">
                     Contactar Tutor
                 </button>
             </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNavbar activeView={currentView} onNavigate={handleNavigate} />
    </div>
  );
}