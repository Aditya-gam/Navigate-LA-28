import React, { Component, ErrorInfo, ReactNode } from "react";

import { errorHandler } from "../utils/errorHandler";
import "../styles/ErrorBoundary.css";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (_error: Error, _errorInfo: ErrorInfo) => void;
  level?: "page" | "component" | "section";
  name?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    };
  }

  override componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    const { onError, name } = this.props;

    // Handle the error using our error handler
    errorHandler.handleComponentError(_error, _errorInfo, name);

    // Call custom error handler if provided
    if (onError) {
      onError(_error, _errorInfo);
    }

    this.setState({ errorInfo: _errorInfo });
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ hasError: false });
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReport = () => {
    const { error, errorInfo, errorId } = this.state;

    // Create a detailed error report
    const report = {
      errorId,
      error: {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      },
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
    };

    // Copy to clipboard for easy reporting
    const textarea = document.createElement("textarea");
    textarea.value = JSON.stringify(report, null, 2);
    document.body.appendChild(textarea);
    textarea.select();

    // use Clipboard API again instead of execCommand
    navigator.clipboard.writeText(textarea.value).finally(() => {
      document.body.removeChild(textarea);
      errorHandler.showSuccess("Error details copied to clipboard!");
    });
  };

  private getCurrentUserId(): string | undefined {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        const tokenParts = token.split(".");
        if (tokenParts.length > 1 && tokenParts[1]) {
          const payload = JSON.parse(atob(tokenParts[1]));
          return payload.sub ?? payload.user_id;
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to extract user ID from token:", error);
      return undefined;
    }
    return undefined;
  }

  private getErrorUI() {
    const { level = "component", name } = this.props;
    const { error, errorId } = this.state;
    const canRetry = this.retryCount < this.maxRetries;

    if (level === "page") {
      return (
        <div className="error-boundary error-boundary--page">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">⚠️</div>
            <h1 className="error-boundary__title">Something went wrong</h1>
            <p className="error-boundary__message">
              We're sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>
            {process.env["NODE_ENV"] === "development" && (
              <details className="error-boundary__details">
                <summary>Error Details (Development)</summary>
                <pre className="error-boundary__error">
                  {error?.message}
                  {error?.stack}
                </pre>
              </details>
            )}
            <div className="error-boundary__actions">
              <button
                className="error-boundary__button error-boundary__button--primary"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
              <button
                className="error-boundary__button error-boundary__button--secondary"
                onClick={this.handleReport}
              >
                Report Issue
              </button>
            </div>
            {errorId && (
              <p className="error-boundary__error-id">Error ID: {errorId}</p>
            )}
          </div>
        </div>
      );
    }

    if (level === "section") {
      return (
        <div className="error-boundary error-boundary--section">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">⚠️</div>
            <h3 className="error-boundary__title">Section Error</h3>
            <p className="error-boundary__message">
              This section couldn't load properly.
            </p>
            <div className="error-boundary__actions">
              {canRetry && (
                <button
                  className="error-boundary__button error-boundary__button--primary"
                  onClick={this.handleRetry}
                >
                  Try Again ({this.maxRetries - this.retryCount} attempts left)
                </button>
              )}
              <button
                className="error-boundary__button error-boundary__button--secondary"
                onClick={this.handleReport}
              >
                Report
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Component level (default)
    return (
      <div className="error-boundary error-boundary--component">
        <div className="error-boundary__container">
          <span className="error-boundary__icon">⚠️</span>
          <span className="error-boundary__message">
            {name ? `${name} failed to load` : "Component error"}
          </span>
          {canRetry && (
            <button
              className="error-boundary__button error-boundary__button--small"
              onClick={this.handleRetry}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  override render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback ?? this.getErrorUI();
    }

    return children;
  }
}

export default ErrorBoundary;

// Higher Order Component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;

  return WrappedComponent;
}
