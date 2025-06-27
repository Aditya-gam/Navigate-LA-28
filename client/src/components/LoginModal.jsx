import React, { useState } from "react";
import PropTypes from "prop-types";
import "../styles/LoginModal.css"; // Importing the CSS file
import { useAuth } from "../hooks/useAuth";

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, isLoading, error, clearError } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    dob: "",
    country: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage("");

    try {
      if (isLoginMode) {
        await login(formData);
        setSuccessMessage("Login successful!");
        setTimeout(() => onSuccess(formData), 1500);
      } else {
        await register(formData);
        setSuccessMessage("Account created! You can now log in.");
        setFormData({ username: "", password: "", dob: "", country: "" });
        setTimeout(() => setIsLoginMode(true), 1500);
      }
    } catch (err) {
      // Error is handled by the auth hook, but we need to satisfy linter
      // eslint-disable-next-line no-console
      console.debug("Auth operation failed:", err);
    }
  };

  if (!isOpen) return null;

  const buttonText = isLoginMode ? "Sign In" : "Create Account";

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isLoginMode ? "Sign In" : "Create Account"}</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="Username"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Password"
            required
          />
          {!isLoginMode && (
            <>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
                placeholder="Date of Birth"
              />
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="Country"
              />
            </>
          )}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : buttonText}
          </button>
        </form>
        <div>
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="switch-mode-button"
          >
            {isLoginMode
              ? "Need an account? Create one"
              : "Already have an account? Sign in"}
          </button>
          <button onClick={onClose} className="close-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

LoginModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default LoginModal;
