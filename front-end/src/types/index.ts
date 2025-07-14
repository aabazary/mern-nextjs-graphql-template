// Auth Types
export interface User {
  id: string;
  email: string;
  role: 'UNREGISTERED' | 'REGISTERED' | 'OWNER' | 'SUPERADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Theme Types
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Navigation Types
export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  authProtected?: boolean;
  isAuthenticated?: boolean;
}

// Component Props Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface LoginFormProps {
  onClose: () => void;
  onToggleToSignup: () => void;
}

export interface SignupFormProps {
  onClose: () => void;
  onToggleToLogin: () => void;
}

export interface ProvidersProps {
  children: React.ReactNode;
}

// Auth Form Types
export enum AuthFormType {
  Login = 'login',
  Signup = 'signup'
}

// GraphQL Types
export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: {
      code?: string;
    };
  }>;
} 