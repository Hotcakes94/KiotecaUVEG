export enum PostType {
  QUESTION = 'QUESTION',
  POLL = 'POLL',
  ACHIEVEMENT = 'ACHIEVEMENT'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  isBot?: boolean; // New field to identify AI users
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string; // Added avatar to comment to easier display
  isBot?: boolean; // Helper for styling
  content: string;
  timestamp: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Post {
  id: string;
  type: PostType;
  author: User;
  content: string; // The question text, or poll title, or achievement description
  timestamp: string;
  comments: Comment[];
  likes: number;
  likedByCurrentUser: boolean;
  
  // Specific to Polls
  pollOptions?: PollOption[];
  totalVotes?: number;
  hasVoted?: boolean;

  // Specific to Achievements
  imageUrl?: string;
}

// --- NEW TYPES FOR STUDY GROUPS ---

export enum ResourceType {
  LINK = 'LINK',
  VIDEO = 'VIDEO',
  BOOK = 'BOOK',
  COMMENT = 'COMMENT',
  AI_RESPONSE = 'AI_RESPONSE'
}

export interface GroupResource {
  id: string;
  type: ResourceType;
  title?: string; // For links/books
  content: string; // Description or message
  url?: string; // For external links
  author: User;
  timestamp: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string; // Tailwind bg class
  textColor: string; // Tailwind text class
  membersCount: number;
  isMember: boolean;
  resources: GroupResource[];
}

// --- THEME TYPES ---
export type ThemeOption = 'light' | 'dark' | 'emerald' | 'pink';