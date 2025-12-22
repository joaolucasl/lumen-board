import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for catching errors in custom components.
 * Prevents errors in user-provided components from crashing the entire canvas.
 * @internal
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('[LumenBoard] Error in custom component:', error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <g className="lb-error-boundary">
          <rect
            width="100%"
            height="100%"
            fill="#fee2e2"
            stroke="#ef4444"
            strokeWidth={1}
            rx={4}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#dc2626"
            fontSize={12}
          >
            Component Error
          </text>
        </g>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
