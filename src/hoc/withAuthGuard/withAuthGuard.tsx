import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';

export type AuthGuardConfig = {
  url: string;
  createAuthHeader: () => [string, string];
  httpClient?: AxiosInstance;
  httpConfig?: AxiosRequestConfig;
  LoadingIndicatorComponent?: React.ComponentType;
  UnauthorizedComponent?: React.ComponentType;
  InternalErrorComponent?: React.ComponentType;
};

function withAuthGuard<T extends object>(Component: React.ComponentType<T>, config: AuthGuardConfig): React.FC<T> {
  const client = config.httpClient || axios;
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  return function AuthGuard(props) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<number>();

    useEffect(() => {
      const controller = new AbortController();
      const [name, token] = config.createAuthHeader();

      client
        .get(config.url, {
          ...config.httpConfig,
          headers: { ...config.httpConfig?.headers, [name]: token },
          signal: controller.signal,
        })
        .then(response => setStatus(response.status))
        .catch(err => {
          if (axios.isAxiosError(err)) {
            setStatus(err.status);
          }
        })
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
