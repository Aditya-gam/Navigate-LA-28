/**
 * Comprehensive error handling utilities for the application
 */

/* eslint-disable no-unused-vars */
export enum ErrorSeverity {
  MEDIUM = 'medium',
  HIGH = 'high',
}
/* eslint-enable no-unused-vars */

export interface ErrorDetails {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  stack?: string;
  timestamp: Date;
  userId?: string;
  userAgent?: string;
  url?: string;
}

export interface ErrorNotification {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private readonly errorQueue: ErrorDetails[] = [];
  private readonly isProduction = process.env['NODE_ENV'] === 'production';
  private readonly sentryEnabled = Boolean(process.env['REACT_APP_SENTRY_DSN']);

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Setup global error handlers for unhandled errors
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: `Unhandled promise rejection: ${event.reason}`,
        severity: ErrorSeverity.HIGH,
        context: { reason: event.reason },
        timestamp: new Date(),
      });
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        severity: ErrorSeverity.HIGH,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        stack: event.error?.stack,
        timestamp: new Date(),
      });
    });
  }

  /**
   * Main error handling method
   */
  public handleError(error: Partial<ErrorDetails>): void {
    const userId = this.getCurrentUserId();
    const errorDetails: ErrorDetails = {
      message: error.message ?? 'An unknown error occurred',
      ...(error.code && { code: error.code }),
      severity: error.severity ?? ErrorSeverity.MEDIUM,
      context: error.context || {},
      ...(error.stack && { stack: error.stack }),
      timestamp: new Date(),
      ...(userId && { userId }),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Add to error queue for potential batch processing
    this.errorQueue.push(errorDetails);

    // Log to console in development
    if (!this.isProduction) {
      this.logToConsole(errorDetails);
    }

    // Send to external error tracking service
    this.sendToErrorTracking(errorDetails);

    // Show user notification if necessary
    if (this.shouldShowNotification(errorDetails.severity)) {
      this.showUserNotification(errorDetails);
    }

    // Store in local storage for offline error reporting
    this.storeErrorLocally(errorDetails);
  }

  /**
   * Handle API errors specifically
   */
  public handleApiError(error: any, context?: Record<string, any>): void {
    const errorMessage = this.extractErrorMessage(error);
    const severity = this.getApiErrorSeverity(error);
    
    this.handleError({
      message: errorMessage,
      severity,
      context: {
        ...context,
        type: 'API_ERROR',
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Handle React component errors
   */
  public handleComponentError(error: Error, errorInfo: any, componentName?: string): void {
    this.handleError({
      message: `Component error in ${componentName ?? 'unknown'}: ${error.message}`,
      severity: ErrorSeverity.HIGH,
      context: {
        component: componentName,
        errorInfo,
        type: 'COMPONENT_ERROR',
      },
      ...(error.stack && { stack: error.stack }),
    });
  }

  /**
   * Show success notification
   */
  public showSuccess(message: string, duration = 3000): void {
    this.showNotification({
      title: 'Success',
      message,
      type: 'success',
      duration,
    });
  }

  /**
   * Show info notification
   */
  public showInfo(message: string, duration = 5000): void {
    this.showNotification({
      title: 'Information',
      message,
      type: 'info',
      duration,
    });
  }

  /**
   * Show warning notification
   */
  public showWarning(message: string, duration = 7000): void {
    this.showNotification({
      title: 'Warning',
      message,
      type: 'warning',
      duration,
    });
  }

  /**
   * Get formatted error message for display
   */
  public getDisplayMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.response?.data?.detail) return error.response.data.detail;
    if (error.response?.data?.message) return error.response.data.message;
    return 'An unexpected error occurred';
  }

  /**
   * Private helper methods
   */
  private extractErrorMessage(error: any): string {
    if (error.response?.data?.detail) return error.response.data.detail;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.message) return error.message;
    return 'An unexpected error occurred';
  }

  private getApiErrorSeverity(error: any): ErrorSeverity {
    const status = error.response?.status;
    if (status >= 500) return ErrorSeverity.HIGH;
    if (status >= 400) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.MEDIUM;
  }

  private shouldShowNotification(severity: ErrorSeverity): boolean {
    return severity === ErrorSeverity.HIGH;
  }

  private logToConsole(error: ErrorDetails): void {
    const logMethod = this.getConsoleLogMethod(error.severity);
    // eslint-disable-next-line no-console
    logMethod('Error:', error);
  }

  private getConsoleLogMethod(severity: ErrorSeverity): (..._args: any[]) => void {
    switch (severity) {
      case ErrorSeverity.HIGH:
        // eslint-disable-next-line no-console
        return console.error;
      case ErrorSeverity.MEDIUM:
        // eslint-disable-next-line no-console
        return console.warn;
      default:
        // eslint-disable-next-line no-console
        return console.log;
    }
  }

  private sendToErrorTracking(_error: ErrorDetails): void {
    if (this.sentryEnabled) {
      // Send to Sentry or other error tracking service
      // This would be implemented based on your error tracking service
    }
  }

  private showUserNotification(error: ErrorDetails): void {
    const message = this.getUserFriendlyMessage(error);
    const duration = this.getNotificationDuration(error.severity);
    
    this.showNotification({
      title: 'Error',
      message,
      type: 'error',
      duration,
    });
  }

  public showNotification(notification: ErrorNotification): void {
    // Implement notification display logic
    // This could use a toast library or custom notification component
    if (!this.isProduction) {
      // In development, we can log notifications for debugging
      /* eslint-disable no-console */
      let logMethod;
      if (notification.type === 'error') {
        logMethod = console.error;
      } else if (notification.type === 'warning') {
        logMethod = console.warn;
      } else if (notification.type === 'success') {
        logMethod = console.info;
      } else {
        logMethod = console.log;
      }
      logMethod('Notification:', notification);
      /* eslint-enable no-console */
    }
  }

  private getUserFriendlyMessage(error: ErrorDetails): string {
    // Convert technical error messages to user-friendly ones
    if (error.message.includes('Network Error')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    if (error.message.includes('401')) {
      return 'You are not authorized to perform this action. Please log in again.';
    }
    if (error.message.includes('404')) {
      return 'The requested resource was not found.';
    }
    if (error.message.includes('500')) {
      return 'A server error occurred. Please try again later.';
    }
    return error.message || 'An unexpected error occurred.';
  }

  private getNotificationDuration(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.HIGH:
        return 8000;  // 8 seconds
      case ErrorSeverity.MEDIUM:
        return 5000;  // 5 seconds
      default:
        return 5000;
    }
  }

  private storeErrorLocally(error: ErrorDetails): void {
    try {
      const storedErrors = this.getStoredErrors();
      storedErrors.push(error);
      
      // Keep only the last 50 errors
      if (storedErrors.length > 50) {
        storedErrors.splice(0, storedErrors.length - 50);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(storedErrors));
    } catch (e) {
      // localStorage is not available or quota exceeded
      if (!this.isProduction) {
        // eslint-disable-next-line no-console
        console.warn('Failed to store error locally:', e);
      }
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Decode JWT token to get user ID
        // This is a simplified version - you might want to use a proper JWT library
        const tokenPart = token.split('.')[1];
        if (tokenPart) {
          const payload = JSON.parse(atob(tokenPart));
          return payload.sub ?? payload.user_id;
        }
      }
    } catch (e) {
      // Return undefined if token is invalid
      if (!this.isProduction) {
        // eslint-disable-next-line no-console
        console.warn('Failed to decode token:', e);
      }
    }
    return undefined;
  }

  public getStoredErrors(): ErrorDetails[] {
    try {
      const stored = localStorage.getItem('app_errors');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      if (!this.isProduction) {
        // eslint-disable-next-line no-console
        console.warn('Failed to parse stored errors:', e);
      }
      return [];
    }
  }

  public clearStoredErrors(): void {
    try {
      localStorage.removeItem('app_errors');
    } catch (e) {
      // localStorage is not available
      if (!this.isProduction) {
        // eslint-disable-next-line no-console
        console.warn('Failed to clear stored errors:', e);
      }
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export convenience functions
export const handleError = (error: any, context?: Record<string, any>) => {
  errorHandler.handleError({
    message: errorHandler.getDisplayMessage(error),
    severity: ErrorSeverity.MEDIUM,
    context: context || {},
  });
};

export const showSuccess = (message: string) => errorHandler.showSuccess(message);
export const showInfo = (message: string) => errorHandler.showInfo(message);
export const showWarning = (message: string) => errorHandler.showWarning(message);
export const showError = (message: string) => {
  errorHandler.showNotification({
    title: 'Error',
    message,
    type: 'error',
    duration: 5000,
  });
};
export const getDisplayMessage = (error: any) => errorHandler.getDisplayMessage(error); 