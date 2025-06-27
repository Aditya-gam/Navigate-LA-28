import React, { useState } from "react";
import PropTypes from "prop-types";
import { submitReview } from "../services/reviewService";
import { showSuccess, showError } from "../utils/errorHandler";

const ReviewModal = ({ isOpen, onClose, place }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!place) {
      setError("No place selected for review");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!review.trim()) {
      setError("Please write a review");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Please log in to submit a review");
        setIsLoading(false);
        return;
      }

      const reviewData = {
        place_id: place.id || place.place_id || generatePlaceId(place),
        rating: rating,
        title: title.trim() || undefined,
        content: review.trim(),
        visit_date: new Date().toISOString().split("T")[0], // Today's date
        metadata: {
          place_name: place.name,
          place_location: {
            latitude: place.latitude,
            longitude: place.longitude,
          },
          search_type: place.type || "unknown",
        },
      };

      const response = await submitReview(reviewData, token);

      showSuccess("Review submitted successfully!");

      // Reset form
      setRating(0);
      setReview("");
      setTitle("");
      onClose();
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.message || "Failed to submit review. Please try again.");
      showError("Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a temporary place ID if none exists
  const generatePlaceId = (place) => {
    if (place.id) return place.id;
    if (place.place_id) return place.place_id;

    // Generate a temporary ID based on coordinates and name
    const lat = place.latitude?.toFixed(6) || "0";
    const lng = place.longitude?.toFixed(6) || "0";
    const name = place.name?.replace(/\s+/g, "-").toLowerCase() || "unnamed";
    return `temp-${name}-${lat}-${lng}`;
  };

  const resetForm = () => {
    setRating(0);
    setReview("");
    setTitle("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ margin: 0, color: "#202124", fontSize: "24px" }}>
            Write a Review
          </h2>
          <button
            onClick={handleClose}
            style={{
              border: "none",
              background: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#5f6368",
            }}
          >
            ×
          </button>
        </div>

        {place && (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                color: "#1a73e8",
                fontSize: "18px",
              }}
            >
              {place.name || "Unnamed Location"}
            </h3>
            <p style={{ margin: 0, color: "#5f6368", fontSize: "14px" }}>
              📍{" "}
              {place.address ||
                `${place.latitude?.toFixed(6)}, ${place.longitude?.toFixed(6)}`}
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#fce8e6",
              color: "#d93025",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#5f6368",
                fontWeight: "500",
              }}
            >
              Rating *
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    fontSize: "28px",
                    cursor: "pointer",
                    color: star <= rating ? "#fbbc04" : "#e0e0e0",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (star > rating) {
                      e.target.style.color = "#fbbc04";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (star > rating) {
                      e.target.style.color = "#e0e0e0";
                    }
                  }}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <span
                  style={{
                    marginLeft: "12px",
                    color: "#5f6368",
                    fontSize: "14px",
                    alignSelf: "center",
                  }}
                >
                  {rating} star{rating > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#5f6368",
                fontWeight: "500",
              }}
            >
              Review Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your review a title..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #dadce0",
                fontSize: "14px",
                outline: "none",
              }}
              maxLength={100}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#5f6368",
                fontWeight: "500",
              }}
            >
              Your Review *
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience... What did you like? What could be improved?"
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #dadce0",
                fontSize: "14px",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
              }}
              maxLength={1000}
            />
            <div
              style={{
                textAlign: "right",
                fontSize: "12px",
                color: "#80868b",
                marginTop: "4px",
              }}
            >
              {review.length}/1000 characters
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                backgroundColor: "transparent",
                color: "#5f6368",
                border: "1px solid #dadce0",
                borderRadius: "4px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || rating === 0 || !review.trim()}
              style={{
                backgroundColor: "#1a73e8",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "500",
                cursor:
                  isLoading || rating === 0 || !review.trim()
                    ? "not-allowed"
                    : "pointer",
                opacity: isLoading || rating === 0 || !review.trim() ? 0.7 : 1,
                flex: 1,
              }}
            >
              {isLoading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ReviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  place: PropTypes.object,
};

export default ReviewModal;
