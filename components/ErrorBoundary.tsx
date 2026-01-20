import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import * as Sentry from "@sentry/react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Log to Sentry if initialized
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error, { extra: errorInfo as any });
    }
  }

  private handleReset = () => {
      this.setState({ hasError: false, error: null });
      window.location.reload();
  }

  private handleGoHome = () => {
      this.setState({ hasError: false, error: null });
      window.location.href = '/';
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-500 mb-8 text-sm">
              We've logged this error and our engineering team has been notified. Please try refreshing the page.
            </p>
            
            {this.state.error && (
                <div className="bg-slate-100 p-4 rounded-lg text-left text-xs font-mono text-slate-600 mb-6 overflow-auto max-h-32 border border-slate-200">
                    {this.state.error.toString()}
                </div>
            )}

            <div className="space-y-3">
                <button 
                    onClick={this.handleReset}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-100"
                >
                    <RefreshCw className="w-4 h-4" /> Reload Application
                </button>
                <button 
                    onClick={this.handleGoHome}
                    className="w-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                    <Home className="w-4 h-4" /> Return to Dashboard
                </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}