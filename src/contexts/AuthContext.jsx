import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get initial user
    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { user, error } = await AuthService.getCurrentUser();
      if (error) throw new Error(error);
      
      setUser(user);
      if (user) {
        await loadUserProfile(user.id);
      }
    } catch (error) {
      console.error('Get current user error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await AuthService.getUserProfile(userId);
      if (error) throw new Error(error);
      setUserProfile(data);
    } catch (error) {
      console.error('Load user profile error:', error);
      // Don't set error here as it's not critical
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user, error } = await AuthService.signUp(email, password, userData);
      if (error) throw new Error(error);
      
      return { user, error: null };
    } catch (error) {
      setError(error.message);
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user, error } = await AuthService.signIn(email, password);
      if (error) throw new Error(error);
      
      return { user, error: null };
    } catch (error) {
      setError(error.message);
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await AuthService.signOut();
      if (error) throw new Error(error);
      
      setUser(null);
      setUserProfile(null);
      return { error: null };
    } catch (error) {
      setError(error.message);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const { data, error } = await AuthService.updateUserProfile(user.id, updates);
      if (error) throw new Error(error);
      
      setUserProfile(prev => ({ ...prev, ...updates }));
      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await AuthService.resetPassword(email);
      if (error) throw new Error(error);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await AuthService.updatePassword(newPassword);
      if (error) throw new Error(error);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
    isSubscribed: userProfile?.subscription_status === 'active' || userProfile?.subscription_status === 'trialing'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
