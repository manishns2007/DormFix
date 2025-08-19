
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full max-w-lg mx-auto my-8 text-center bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle>Oops! Something went wrong.</CardTitle>
            <CardDescription>
              We encountered a client-side error. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
             <Button onClick={() => window.location.reload()}>Refresh Page</Button>
             <Button variant="ghost" onClick={this.handleReset}>Try to render again</Button>
            {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                    <summary className="cursor-pointer">Error Details</summary>
                    <pre className="mt-2 p-2 bg-background rounded-md text-xs whitespace-pre-wrap">
                        {this.state.error?.toString()}
                    </pre>
                </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
