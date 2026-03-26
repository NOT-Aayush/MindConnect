import React from "react";

type State = { hasError: boolean; error?: Error | null };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("Unhandled error in React tree:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-xl text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-4 text-sm text-muted-foreground">An unexpected error occurred. Please refresh the page or contact support.</p>
            <pre className="text-xs whitespace-pre-wrap text-left bg-muted/60 p-3 rounded">{String(this.state.error)}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
