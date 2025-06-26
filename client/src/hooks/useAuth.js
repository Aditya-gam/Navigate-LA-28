// src/hooks/useAuth.js
import { useDispatch, useSelector } from 'react-redux';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError,
} from '../slices/authSlice';
import { loginUser, registerUser } from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, token, isLoading, error } = useSelector((state) => state.auth);

  const login = async (credentials) => {
    try {
      dispatch(loginStart());
      const response = await loginUser(credentials);
      dispatch(loginSuccess({
        user: { username: credentials.username },
        token: response.access_token,
      }));
      return response;
    } catch (error) {
      dispatch(loginFailure(error.message || 'Login failed'));
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch(loginStart());
      const response = await registerUser(userData);
      dispatch(loginSuccess({
        user: { username: userData.username },
        token: response.access_token,
      }));
      return response;
    } catch (error) {
      dispatch(loginFailure(error.message || 'Registration failed'));
      throw error;
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    token,
    isLoading,
    error,
    login,
    register,
    logout: logoutUser,
    clearError: clearAuthError,
  };
};
