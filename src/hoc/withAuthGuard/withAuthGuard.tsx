import axios, { AxiosRequestConfig } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { HttpClient } from '../../interfaces/Record';
import cookies from '../../utils/cookies/cookies';
import { LoginKeys } from '../../utils/login/login';

export type AuthGuardConfig = {
  url: string;
  exceptOr?: boolean[];
  exceptAnd?: boolean[];
  useError?: (status: number) => React.ComponentType | null;
  LoadingIndicatorComponent?: React.ComponentType;
} & Pick<LoginKeys, 'authKey'> &
  HttpClient;

function withAuthGuard<T extends object>(Component: React.ComponentType<T>, config: AuthGuardConfig): React.FC<T> {
  const client = config.httpClient || axios;
  const useErrorHook = config.useError ? config.useError : (_: number) => null;

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  return function AuthGuard(props) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<number>(200);
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
    const Unauthorized = useCallback(() => (!!Fallback ? <Fallback /> : <Fallback401 />), []);

    const Fallback500 = useCallback(() => <div data-testid="auth-error-500">500</div>, []);
    const InternalError = useCallback(() => (!!Fallback ? <Fallback /> : <Fallback500 />), []);

    const hasException = useCallback(() => {
      const isValidExceptOr = Array.isArray(config.exceptOr) && config.exceptOr.length > 0;
      const isValidExceptAnd = Array.isArray(config.exceptAnd) && config.exceptAnd.length > 0;
      const isExceptOr = config.exceptOr?.some(ex => ex) || false;
      const isExceptAnd = config.exceptAnd?.every(ex => ex) || false;

      if (isValidExceptOr && isValidExceptAnd) return isExceptOr && isExceptAnd;
      if (isValidExceptOr) return isExceptOr;
      if (isValidExceptAnd) return isExceptAnd;

      return false;
    }, []);

    if (!hasException()) {
      if (isLoading) return <Loading />;
      if (status === 401) return <Unauthorized />;
      if (status === 500) return <InternalError />;
    }

    return <Component {...props} />;
  };
}

export default withAuthGuard;
