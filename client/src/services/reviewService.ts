import axios from "../utils/api";
import type { Review, ReviewSubmission, APIResponse } from "@/types";

/**
 * Submit a review for a place
 * @param reviewData - Review data to submit
 * @param token - Optional access token
 * @returns Response from server
 */
export const submitReview = async (
  reviewData: ReviewSubmission, 
  token?: string
): Promise<APIResponse<Review>> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await axios.post("/reviews/", reviewData, { headers });
  return response.data;
};

/**
 * Get reviews for a specific place
 * @param placeId - Place ID to get reviews for
 * @param options - Query options (limit, offset, sort)
 * @param token - Optional access token
 * @returns Response with reviews
 */
export const getPlaceReviews = async (
  placeId: string, 
  options: { limit?: number; offset?: number; sort?: string } = {}, 
  token?: string
): Promise<APIResponse<{ reviews: Review[]; pagination: any; summary: any }>> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const params = new URLSearchParams();
  if (options.limit) params.append("limit", options.limit.toString());
  if (options.offset) params.append("offset", options.offset.toString());
  if (options.sort) params.append("sort", options.sort);

  const response = await axios.get(`/places/${placeId}/reviews?${params}`, { headers });
  return response.data;
};

/**
 * Get reviews by a specific user
 * @param userId - User ID to get reviews for
 * @param options - Query options
 * @param token - Access token
 * @returns Response with user reviews
 */
export const getUserReviews = async (
  userId: string, 
  options: { limit?: number; offset?: number } = {}, 
  token: string
): Promise<APIResponse<Review[]>> => {
  const params = new URLSearchParams();
  if (options.limit) params.append("limit", options.limit.toString());
  if (options.offset) params.append("offset", options.offset.toString());

  const response = await axios.get(`/users/${userId}/reviews?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Update an existing review
 * @param reviewId - Review ID to update
 * @param reviewData - Updated review data
 * @param token - Access token
 * @returns Response with updated review
 */
export const updateReview = async (
  reviewId: string, 
  reviewData: Partial<ReviewSubmission>, 
  token: string
): Promise<APIResponse<Review>> => {
  const response = await axios.put(`/reviews/${reviewId}`, reviewData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Delete a review
 * @param reviewId - Review ID to delete
 * @param token - Access token
 * @returns Response indicating success
 */
export const deleteReview = async (
  reviewId: string, 
  token: string
): Promise<APIResponse> => {
  const response = await axios.delete(`/reviews/${reviewId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Mark a review as helpful
 * @param reviewId - Review ID to mark as helpful
 * @param token - Access token
 * @returns Response indicating success
 */
export const markReviewHelpful = async (
  reviewId: string, 
  token: string
): Promise<APIResponse> => {
  const response = await axios.post(`/reviews/${reviewId}/helpful`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get review statistics for a place
 * @param placeId - Place ID to get statistics for
 * @param token - Optional access token
 * @returns Response with review statistics
 */
export const getReviewStatistics = async (
  placeId: string, 
  token?: string
): Promise<APIResponse<{ average_rating: number; total_reviews: number; rating_distribution: Record<string, number> }>> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await axios.get(`/places/${placeId}/reviews/statistics`, { headers });
  return response.data;
}; 