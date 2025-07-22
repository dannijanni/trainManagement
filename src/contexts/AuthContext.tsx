import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import LocalStorageManager from '../utils/localStorage';
import axios from 'axios';
import { Base_URL } from '../config';

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
    const response = await axios.post(`${Base_URL}/auth/loginUser`, {
      email: username, // Assuming username can be an email
      password: password,
    });

    const data = response.data;
    console.log('Login response:', data);

    if (data.userId) {
      // Assuming you want to store some user data in localStorage
      const user: User = {
        id: data.userId,
        username: data.username,
        email: data.email,
        password: '', // Password should not be stored, but required by type
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        role: data.roleId === 1 ? 'admin' : 'customer', // Adjust role mapping as needed
        createdAt: data.createdAt || new Date().toISOString(),
        isActive: false
      };

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