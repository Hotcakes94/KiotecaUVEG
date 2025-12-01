import React, { useState } from 'react';
import { Post, PostType, Comment, User } from '../types';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onVote: (postId: string, optionId: string) => void;
  onComment: (postId: string, text: string) => void;
  onLike: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onVote, onComment, onLike }) => {
  const [commentText, setCommentText] = useState('');

  const getBorderColor = () => {
    switch (post.type) {
      case PostType.QUESTION: return 'border-l-4 border-l-purple-600';
      case PostType.POLL: return 'border-l-4 border-l-teal-500';
      case PostType.ACHIEVEMENT: return 'border-l-4 border-l-yellow-600';
      default: return '';
    }
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm mb-6 overflow-hidden ${getBorderColor()} transition-transform duration-200`}>
      <div className="p-5">
        {/* Author Header */}
        <div className="flex items-center mb-4">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div>
            <h3 className="font-bold text-gray-800 text-base">{post.author.name}</h3>
            <span className="text-xs text-gray-500 block">{post.timestamp}</span>
          </div>
          {post.type === PostType.POLL && (
            <span className="ml-auto bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-medium">Encuesta</span>
          )}
           {post.type === PostType.ACHIEVEMENT && (
            <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Logro</span>
          )}
        </div>

        {/* Content */}
        <h2 className="text-xl text-gray-800 mb-4 font-medium leading-relaxed">
          {post.content}
        </h2>

        {/* POLL RENDER */}
        {post.type === PostType.POLL && post.pollOptions && (
          <div className="space-y-3 mb-4">
            {post.pollOptions.map((option) => {
              const percentage = post.totalVotes ? Math.round((option.votes / post.totalVotes) * 100) : 0;
              return (
                <div key={option.id} className="relative">
                  <button
                    onClick={() => !post.hasVoted && onVote(post.id, option.id)}
                    disabled={post.hasVoted}
                    className={`w-full text-left p-3 rounded-lg border relative z-10 transition-all flex justify-between items-center active-scale ${
                      post.hasVoted 
                        ? 'border-gray-200 cursor-default' 
                        : 'border-gray-200 hover:border-teal-500 hover:bg-teal-50'
                    }`}
                  >
                    <span className="font-medium text-gray-700">{option.text}</span>
                    {post.hasVoted && <span className="font-bold text-gray-600">{percentage}%</span>}
                  </button>
                  {/* Progress Bar Background */}
                  {post.hasVoted && (
                    <div 
                        className="absolute top-0 left-0 h-full bg-teal-100 rounded-lg z-0 transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%`, opacity: 0.5 }}
                    ></div>
                  )}
                </div>
              );
            })}
            <div className="text-xs text-gray-500 text-right mt-1">
                {post.totalVotes} votos totales
            </div>
          </div>
        )}

        {/* ACHIEVEMENT RENDER */}
        {post.type === PostType.ACHIEVEMENT && post.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
            <img src={post.imageUrl} alt="Achievement" className="w-full h-auto object-cover max-h-96" />
          </div>
        )}

        {/* Interactions Bar */}
        <div className="flex items-center pt-4 border-t border-gray-100 mt-4">
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center space-x-2 text-sm active-scale ${post.likedByCurrentUser ? 'text-pink-600 font-bold' : 'text-gray-500 hover:text-pink-600'}`}
          >
            <i className={`${post.likedByCurrentUser ? 'fas' : 'far'} fa-heart`}></i>
            <span>{post.likes} Me gusta</span>
          </button>
          
          <div className="flex items-center space-x-2 text-gray-500 text-sm ml-6">
            <i className="far fa-comment-alt"></i>
            <span>{post.comments.length} Comentarios</span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
            {post.comments.length > 0 && (
                <div className="space-y-4 mb-4">
                    {post.comments.map(comment => (
                        <div key={comment.id} className="flex space-x-3">
                             <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border ${comment.isBot ? 'border-purple-400 bg-purple-100' : 'border-gray-200 bg-gray-300'}`}>
                                {comment.userAvatar ? (
                                   <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                                ) : (
                                   <span className="text-xs font-bold text-gray-600">{comment.userName.substring(0,2).toUpperCase()}</span>
                                )}
                             </div>
                             <div className={`p-3 rounded-lg rounded-tl-none shadow-sm border flex-1 ${comment.isBot ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-100'}`}>
                                 <div className="flex justify-between items-baseline mb-1">
                                     <div className="flex items-center">
                                       <span className={`text-sm font-bold ${comment.isBot ? 'text-indigo-700' : 'text-purple-900'}`}>{comment.userName}</span>
                                       {comment.isBot && <span className="ml-2 px-1.5 py-0.5 bg-indigo-200 text-indigo-800 text-[10px] rounded font-bold uppercase tracking-wider">IA BOT</span>}
                                     </div>
                                     <span className="text-xs text-gray-400">{comment.timestamp}</span>
                                 </div>
                                 <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                             </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                    placeholder="Escribe un comentario..."
                    className="flex-1 bg-white border border-gray-300 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button 
                    onClick={handleCommentSubmit}
                    className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors active-scale"
                >
                    <i className="fas fa-paper-plane text-xs"></i>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};