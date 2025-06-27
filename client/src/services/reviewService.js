/**
 * Submit a new review for a place
 * @param {Object} reviewData - Review data including rating, content, place_id, etc.
 * @param {string} token - Authentication token
 * @returns {Promise} Response from server
 */
export const submitReview = async (reviewData, token = null) => {
  const url = new URL("http://localhost:8001/api/reviews/");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    );
  }

  return await response.json();
};

/**
 * Get reviews for a specific place
 * @param {string} placeId - Place ID
 * @param {Object} options - Query options (limit, offset, sort)
 * @param {string} token - Optional authentication token
 * @returns {Promise} Response with reviews
 */
export const getPlaceReviews = async (placeId, options = {}, token = null) => {
  const url = new URL(`http://localhost:8001/api/reviews/place/${placeId}/`);

  // Add query parameters
  if (options.limit) url.searchParams.append("limit", options.limit);
  if (options.offset) url.searchParams.append("offset", options.offset);
  if (options.sort) url.searchParams.append("sort", options.sort);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Get user's reviews
 * @param {string} userId - User ID
 * @param {Object} options - Query options (limit, offset)
 * @param {string} token - Authentication token
 * @returns {Promise} Response with user reviews
 */
export const getUserReviews = async (userId, options = {}, token) => {
  const url = new URL(`http://localhost:8001/api/reviews/user/${userId}/`);

  // Add query parameters
  if (options.limit) url.searchParams.append("limit", options.limit);
  if (options.offset) url.searchParams.append("offset", options.offset);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Update an existing review
 * @param {string} reviewId - Review ID
 * @param {Object} reviewData - Updated review data
 * @param {string} token - Authentication token
 * @returns {Promise} Response from server
 */
export const updateReview = async (reviewId, reviewData, token) => {
  const url = new URL(`http://localhost:8001/api/reviews/${reviewId}/`);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    );
  }

  return await response.json();
};

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 * @param {string} token - Authentication token
 * @returns {Promise} Response from server
 */
export const deleteReview = async (reviewId, token) => {
  const url = new URL(`http://localhost:8001/api/reviews/${reviewId}/`);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    );
  }

  return response.status === 204 ? { success: true } : await response.json();
};

/**
 * Mark a review as helpful
 * @param {string} reviewId - Review ID
 * @param {string} token - Authentication token
 * @returns {Promise} Response from server
 */
export const markReviewHelpful = async (reviewId, token) => {
  const url = new URL(`http://localhost:8001/api/reviews/${reviewId}/helpful/`);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    );
  }

  return await response.json();
};

/**
 * Get review statistics for a place
 * @param {string} placeId - Place ID
 * @param {string} token - Optional authentication token
 * @returns {Promise} Response with review statistics
 */
export const getReviewStatistics = async (placeId, token = null) => {
  const url = new URL(`http://localhost:8001/api/reviews/stats/${placeId}/`);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
