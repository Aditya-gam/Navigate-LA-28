import axios from "../utils/api";
import { AUTH_ENDPOINTS } from "../constants/apiEndpoints";
import type { LoginFormData, RegisterFormData, APIResponse } from "@/types";

/**
 * Authenticate user login.
 * @param formData - User credentials { email, password }.
 * @returns Response from server.
 */
export const loginUser = async (
  formData: LoginFormData,
): Promise<APIResponse> => {
  const response = await axios.post(
    AUTH_ENDPOINTS.LOGIN,
    new URLSearchParams({
      email: formData.email,
      password: formData.password,
    }),
  );
  return response.data;
};

/**
 * Register a new user.
 * @param formData - User details { username, email, password, confirmPassword, first_name, last_name, date_of_birth, country }.
 * @returns Response from server.
 */
export const registerUser = async (
  formData: RegisterFormData,
): Promise<APIResponse> => {
  const response = await axios.post(AUTH_ENDPOINTS.REGISTER, formData);
  return response.data;
};
