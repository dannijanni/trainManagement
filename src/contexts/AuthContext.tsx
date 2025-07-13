import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import LocalStorageManager from '../utils/localStorage';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('train_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const users = LocalStorageManager.getUsers();
      const user = users.find(u => 
        (u.username === username || u.email === username) && 
        u.password === password && 
        u.isActive
      );

      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false
        });
        localStorage.setItem('train_current_user', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const users = LocalStorageManager.getUsers();
      
      // Check if user already exists
      const existingUser = users.find(u => 
        u.username === userData.username || u.email === userData.email
      );
      
      if (existingUser) {
        return false;
      }

      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      LocalStorageManager.saveUsers(users);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false
    });
    localStorage.removeItem('train_current_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      setAuthState(prev => ({ ...prev, user: updatedUser }));
      localStorage.setItem('train_current_user', JSON.stringify(updatedUser));
      
      // Update in users list
      const users = LocalStorageManager.getUsers();
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        LocalStorageManager.saveUsers(users);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};