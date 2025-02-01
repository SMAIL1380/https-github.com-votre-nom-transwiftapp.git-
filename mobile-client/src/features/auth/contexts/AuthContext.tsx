import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, AuthContextType, RegisterData } from '../types/auth.types';
import { AuthService } from '../services/auth.service';

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

type AuthAction =
  | { type: 'SET_USER'; payload: AuthState['user'] }
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('user_data'),
      ]);

      if (token && userData) {
        dispatch({ type: 'SET_TOKEN', payload: token });
        dispatch({ type: 'SET_USER', payload: JSON.parse(userData) });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { user, token } = await AuthService.login({ email, password });
      
      await Promise.all([
        AsyncStorage.setItem('auth_token', token),
        AsyncStorage.setItem('user_data', JSON.stringify(user)),
      ]);

      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Login failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { user, token } = await AuthService.register(data);
      
      await Promise.all([
        AsyncStorage.setItem('auth_token', token),
        AsyncStorage.setItem('user_data', JSON.stringify(user)),
      ]);

      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Registration failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      if (state.token) {
        await AuthService.logout(state.token);
      }
      await Promise.all([
        AsyncStorage.removeItem('auth_token'),
        AsyncStorage.removeItem('user_data'),
      ]);
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await AuthService.resetPassword(email);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Password reset failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProfile = async (data: Partial<AuthState['user']>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      if (state.user && state.user.id) {
        const updatedUser = await AuthService.updateProfile(state.user.id, data);
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        dispatch({ type: 'SET_USER', payload: updatedUser });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Profile update failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
