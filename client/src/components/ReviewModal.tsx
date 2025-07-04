import React, { useState } from "react";
import { submitReview } from "@/services/reviewService";
import { showSuccess, showError } from "@/utils/errorHandler";
import type { ReviewModalProps, Place, ReviewSubmission } from "@/types";

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  place,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
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

      const reviewData: ReviewSubmission = {
        place_id: place.id ?? place.place_id ?? generatePlaceId(place),
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
          search_type: place.type ?? "unknown",
        },
      };

      await submitReview(reviewData, token);

      showSuccess("Review submitted successfully!");

      // Reset form
      setRating(0);
      setReview("");
      setTitle("");
      onClose();
    } catch (err) {
      // Error submitting review: (see error handling below)
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to submit review. Please try again.";
      setError(errorMessage);
      showError("Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a temporary place ID if none exists
  const generatePlaceId = (place: Place): string => {
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
              {place.address ??
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
              htmlFor="rating-stars"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#202124",
              }}
            >
              Rating *
            </label>
            <fieldset
              id="rating-stars"
              style={{
                display: "flex",
                gap: "8px",
                border: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                  aria-pressed={star === rating}
                  style={{
                    border: "none",
                    background: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: star <= rating ? "#f4b400" : "#dadce0",
                    padding: "4px",
                  }}
                >
                  ★
                </button>
              ))}
            </fieldset>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="review-title"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#202124",
              }}
            >
              Title (Optional)
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your review a title..."
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #dadce0",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="review-content"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#202124",
              }}
            >
              Review *
            </label>
            <textarea
              id="review-content"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
              rows={6}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #dadce0",
                borderRadius: "4px",
                fontSize: "14px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "12px 24px",
                border: "1px solid #dadce0",
                borderRadius: "4px",
                backgroundColor: "white",
                color: "#5f6368",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: isLoading ? "#dadce0" : "#1a73e8",
                color: "white",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "14px",
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

export default ReviewModal;
