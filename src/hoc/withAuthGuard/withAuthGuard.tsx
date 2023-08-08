import axios, { AxiosRequestConfig } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { HttpClient } from '../../interfaces/Record';
import cookies from '../../utils/cookies/cookies';
import { LoginKeys } from '../../utils/login/login';

export type AuthGuardConfig = {
  url: string;
  useException?: () => boolean;
  useError?: (status: number | null) => JSX.Element | null;
  LoadingIndicatorComponent?: React.ComponentType;
} & Pick<LoginKeys, 'authKey'> &
  HttpClient;

function withAuthGuard<T extends object>(Component: React.ComponentType<T>, config: AuthGuardConfig): React.FC<T> {
  const client = config.httpClient || axios;
  const useExceptionHook = config.useException ? config.useException : () => false;
  const useErrorHook = config.useError ? config.useError : (_: number | null) => null;

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  return function AuthGuard(props) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [status, setStatus] = useState<number | null>(null);
    const hasException = useExceptionHook();
    const Fallback = useErrorHook(status);

    useEffect(() => {
      const controller = new AbortController();
      const name = config.authKey || 'authorization';
      const conf = (config.httpConfig || {}) as AxiosRequestConfig<unknown>;
      const token = `Bearer ${cookies.get(name)}`;

      if (conf.headers) conf.headers[name] = token;
      else conf.headers = { [name]: token };
      conf.signal = controller.signal;

      client
        .get(config.url, conf)
        .then(response => setStatus(response.status))
        .catch(err => setStatus(err.response?.status || 500))
        .finally(() => setIsLoading(false));

      return () => {
        controller.abort();
      };
    }, []);

    const FallbackLoading = useCallback(() => <div data-testid="loading">Loading...</div>, []);
    const Loading = useCallback(
      () => (!!config.LoadingIndicatorComponent ? <config.LoadingIndicatorComponent /> : <FallbackLoading />),
      []
    );

    const Fallback401 = useCallback(() => <div data-testid="auth-error-401">401</div>, []);
    const Unauthorized = useCallback(() => (!!Fallback ? Fallback : <Fallback401 />), []);

    const Fallback500 = useCallback(() => <div data-testid="auth-error-500">500</div>, []);
    const InternalError = useCallback(() => (!!Fallback ? Fallback : <Fallback500 />), []);

    if (!hasException) {
      if (isLoading) return <Loading />;
      if (status === 401) return <Unauthorized />;
      if (status === 500) return <InternalError />;
    }

    return <Component {...props} />;
  };
}

export default withAuthGuard;
