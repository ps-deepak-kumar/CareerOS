import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  pageName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — Phase 6
 *
 * React class component error boundary with a friendly fallback UI.
 * Catches runtime errors in any wrapped page/component and prevents
 * a blank screen. Logs errors to AgentTerminal via stateManager.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[CareerOS ErrorBoundary]', error, info);
    // Log to AgentTerminal (async import to avoid circular dep)
    import('../services/stateManager').then(({ stateManager }) => {
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Orchestrator Agent',
        action: 'page_error_caught',
        status: 'error',
        message: `⚠️ Error caught in "${this.props.pageName ?? 'unknown page'}": ${error.message}`,
        reasoning: 'React ErrorBoundary intercepted a runtime exception. Showing graceful fallback UI.',
      });
    }).catch(() => { /* stateManager not available */ });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-zinc-800 mb-2">
            Something went wrong on {this.props.pageName ?? 'this page'}
          </h2>
          <p className="text-sm text-zinc-500 max-w-md mb-1">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <p className="text-xs text-zinc-400 max-w-md mb-6">
            Your data is safe — this page encountered a runtime error. You can retry or navigate to another page.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-5 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.hash = '#/dashboard'}
              className="px-5 py-2 bg-zinc-100 text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-200 transition-colors border border-zinc-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
