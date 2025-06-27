import { useDispatch, useSelector } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} from "../slices/authSlice";
import { loginUser, registerUser } from "../services/authService";
import type { RootState, LoginFormData, RegisterFormData, User } from "@/types";

interface AuthResponse {
  access_token: string;
  user: User;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, token, isLoading, error } = useSelector(
    (state: RootState) => state.auth,
  );

  const login = async (credentials: LoginFormData): Promise<AuthResponse> => {
    try {
      dispatch(loginStart());
      const response = await loginUser(credentials);
      const authResponse = response as unknown as AuthResponse;
      dispatch(
        loginSuccess({
          user: { username: credentials.email } as User, // Using email as username for now
          token: authResponse.access_token,
        }),
      );
      return authResponse;
    } catch (error: any) {
      dispatch(loginFailure(error.message ?? "Login failed"));
      throw error;
    }
  };

  const register = async (userData: RegisterFormData): Promise<AuthResponse> => {
    try {
      dispatch(loginStart());
      const response = await registerUser(userData);
      const authResponse = response as unknown as AuthResponse;
      dispatch(
        loginSuccess({
          user: { username: userData.username } as User,
          token: authResponse.access_token,
        }),
      );
      return authResponse;
    } catch (error: any) {
      dispatch(loginFailure(error.message ?? "Registration failed"));
      throw error;
    }
  };

  const logoutUser = (): void => {
    dispatch(logout());
  };

  const clearAuthError = (): void => {
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