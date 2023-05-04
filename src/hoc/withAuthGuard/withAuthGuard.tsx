import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';

export type AuthGuardConfig = {
  url: string;
  createAuthHeader: () => [string, string];
  LoadingIndicatorComponent?: React.ComponentType;
  UnauthorizedComponent?: React.ComponentType;
  InternalErrorComponent?: React.ComponentType;
};

function withAuthGuard<T extends object>(Component: React.ComponentType<T>, config: AuthGuardConfig): React.FC<T> {
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  return function AuthGuard(props) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<number>(Infinity);

    useEffect(() => {
      const controller = new AbortController();
      const [name, token] = config.createAuthHeader();

      axios
        .get(config.url, { headers: { [name]: token }, signal: controller.signal })
        .then(response => setStatus(response.status))
        .finally(() => setIsLoading(false));

      return () => {
        controller.abort();
      };
    }, []);

    // TODO: create better fallbacks
    const FallbackLoading = () => <div data-testid="loading">Loading...</div>;
    const Loading = useCallback(
      () => (!!config.LoadingIndicatorComponent ? <config.LoadingIndicatorComponent /> : <FallbackLoading />),
      []
    );

    const Fallback401 = () => <div data-testid="auth-error-401">401</div>;
    const Unauthorized = useCallback(
      () => (!!config.UnauthorizedComponent ? <config.UnauthorizedComponent /> : <Fallback401 />),
      []
    );

    const Fallback500 = () => <div data-testid="auth-error-500">500</div>;
    const InternalError = useCallback(
      () => (!!config.InternalErrorComponent ? <config.InternalErrorComponent /> : <Fallback500 />),
      []
    );

    if (isLoading) return <Loading />;
    if (status === 401) return <Unauthorized />;
    if (status === 500) return <InternalError />;
    return <Component {...props} />;
  };
}

export default withAuthGuard;