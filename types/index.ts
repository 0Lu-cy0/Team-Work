export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role?: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    progress: number;
    dueDate: string;
    teamMembers: string[];
    completed: boolean;
}

export interface Task {
    id: string;
    projectId: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate: string;
    dueTime: string;
    assignees: string[];
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    read: boolean;
    image?: string;
}

export interface ChatGroup {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    members: string[];
}

export interface Notification {
    id: string;
    userId: string;
    content: string;
    projectName: string;
    timestamp: string;
    read: boolean;
}

export interface Contact {
    id: string;
    name: string;
    avatar: string;
    letter: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface ProjectsState {
    projects: Project[];
    currentProject: Project | null;
    isLoading: boolean;
    error: string | null;
}

export interface TasksState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;
}

export interface MessagesState {
    messages: Message[];
    chatGroups: ChatGroup[];
    currentChat: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
}

export interface UIState {
    activeTab: string;
}