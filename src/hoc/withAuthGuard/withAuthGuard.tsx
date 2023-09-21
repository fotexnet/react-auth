import axios, { AxiosRequestConfig, isAxiosError } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { HttpClient } from '../../interfaces/Record';
import cookies from '../../utils/cookies/cookies';
import { LoginKeys } from '../../utils/login/login';

type UseErrorResult = {
  Component: JSX.Element | null;
  action?: () => void;
};

export type AuthGuardConfig = {
  url: string;
  useException?: () => boolean;
  useError?: (status: number | null) => UseErrorResult;
  LoadingIndicatorComponent?: React.ComponentType;
} & Pick<LoginKeys, 'authKey'> &
  HttpClient;

function withAuthGuard<T extends object>(Component: React.ComponentType<T>, config: AuthGuardConfig): React.FC<T> {
  const client = config.httpClient || axios;
  const useExceptionHook = config.useException ? config.useException : () => false;
  const useErrorHook = config.useError ? config.useError : (_: number | null): UseErrorResult => ({ Component: null });

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  return function AuthGuard(props) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [status, setStatus] = useState<number | null>(null);
    const hasException = useExceptionHook();
    const errorResult = useErrorHook(status);

    useEffect(() => {
      const controller = new AbortController();
      const name = config.authKey || 'authorization';
      const conf = (config.httpConfig || {}) as AxiosRequestConfig<unknown>;
      const token = `Bearer ${cookies.get(name)}`;

      if (conf.headers) conf.headers[name] = token;
      else conf.headers = { [name]: token };
      conf.signal = controller.signal;

      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const { status: s } = await client.get(config.url, conf);
          setStatus(s);
        } catch (err) {
          if (isAxiosError(err)) setStatus(err.response?.status || 500);
          else setStatus(500);
        }
        setIsLoading(false);
      };

      fetchUser();

      return () => {
        controller.abort();
      };
    }, []);

    useEffect(() => {
      if (!errorResult.action) return;
      errorResult.action();
    }, [errorResult.action]);

    const FallbackLoading = useCallback(() => <div data-testid="loading">Loading...</div>, []);
    const Loading = useCallback(
      () => (!!config.LoadingIndicatorComponent ? <config.LoadingIndicatorComponent /> : <FallbackLoading />),
      []
    );

    const Fallback401 = useCallback(() => <div data-testid="auth-error-401">401</div>, []);
    const Unauthorized = useCallback(() => (!!errorResult.Component ? errorResult.Component : <Fallback401 />), []);

    const Fallback500 = useCallback(() => <div data-testid="auth-error-500">500</div>, []);
    const InternalError = useCallback(() => (!!errorResult.Component ? errorResult.Component : <Fallback500 />), []);

    if (isLoading) return <Loading />;

    if (!hasException) {
      if (status === 401) return <Unauthorized />;
      if (status === 500) return <InternalError />;
    }

    return <Component {...props} />;
  };
}

export default withAuthGuard;
