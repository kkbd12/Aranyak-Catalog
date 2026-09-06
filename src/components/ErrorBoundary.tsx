import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">
              কিছু একটা সমস্যা হয়েছে
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              অ্যাপ্লিকেশনটি লোড হতে সাময়িক সমস্যা হচ্ছে। পেজটি পুনরায় লোড করার চেষ্টা করুন।
            </p>
            {this.state.error?.message && (
              <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-700 font-mono mb-6 text-left break-all max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>পেজ রিলোড করুন</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
