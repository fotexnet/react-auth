import axios, { AxiosRequestConfig } from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

      if (conf.headers) conf.headers[name] = cookies.get(name);
      else conf.headers = { [name]: cookies.get(name) };
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

    // TODO: create better fallbacks
    const FallbackLoading = () => <div data-testid="loading">Loading...</div>;
    const Loading = useCallback(
      () => (!!config.LoadingIndicatorComponent ? <config.LoadingIndicatorComponent /> : <FallbackLoading />),
      []
    );

    const Fallback401 = () => <div data-testid="auth-error-401">401</div>;
    const Unauthorized = useCallback(() => (!!Fallback ? <Fallback /> : <Fallback401 />), []);

    const Fallback500 = () => <div data-testid="auth-error-500">500</div>;
    const InternalError = useCallback(() => (!!Fallback ? <Fallback /> : <Fallback500 />), []);

    const isExceptOr = useMemo(() => config.exceptOr?.some(ex => ex), []);
    const isExceptAnd = useMemo(() => config.exceptAnd?.every(ex => ex), []);
    const isValidExceptOr = useMemo(() => Array.isArray(config.exceptOr) && config.exceptOr.length > 1, []);
    const isValidExceptAnd = useMemo(() => Array.isArray(config.exceptAnd) && config.exceptAnd.length > 1, []);
    const isMultipleRelations = useMemo(() => isValidExceptOr && isValidExceptAnd, []);
    const isSingleRelation = useMemo(
      () => (!isValidExceptOr && isValidExceptAnd) || (isValidExceptOr && !isValidExceptAnd),
      []
    );
    const isBothException = useMemo(() => isMultipleRelations && isExceptOr && isExceptAnd, []);
    const isAndOrException = useMemo(() => isSingleRelation && (isExceptOr || isExceptAnd), []);

    if (isBothException || isAndOrException) {
      if (isLoading) return <Loading />;
      if (status === 401) return <Unauthorized />;
      if (status === 500) return <InternalError />;
    }

    return <Component {...props} />;
  };
}

export default withAuthGuard;
