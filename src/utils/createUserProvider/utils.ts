import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useMemo, useCallback, useState, useEffect, DependencyList } from 'react';
import { useCookie } from '../../hooks';
import { HttpClient } from '../../interfaces/Record';
import cookies from '../cookies/cookies';
import { Provider } from '../login/login';
import { DefaultUser, Interceptors, UserProviderConfig, UserProviderMode } from './types';

export function useConfig<TUser extends DefaultUser = DefaultUser>(
  config: UserProviderConfig<TUser>
): UseConfigResult<TUser> {
  const keys = useMemo(() => ({ dataKey: config.dataKey, authKey: config.authKey || 'authorization' }), []);
  const initialUserConfig: UserProviderMode<TUser> = useMemo(() => {
    return config.mode === 'fetch'
      ? { mode: config.mode, useProfile: config.useProfile }
      : { mode: config.mode, storage: config.storage, key: config.key };
  }, []);
  const httpClientConfig: HttpClient = useMemo(() => {
    return { httpClient: config.httpClient, httpConfig: config.httpConfig };
  }, []);
  const extractUrl = useCallback((provider: Provider) => {
    return config.localOnly ? config.loginUrl : provider === 'local' ? config.loginUrl.local : config.loginUrl.social;
  }, []);

  return { keys, initialUserConfig, httpClientConfig, extractUrl };
}

// TODO: set user if mode set to storage (?)
export function useInitialUser<TUser extends DefaultUser = DefaultUser>(
  config: UserProviderMode<TUser> & HttpClient,
  dependencies: DependencyList = []
): UseInitialUserResult<TUser> {
  const parseInitialUser = useCallback((str?: string | null) => {
    return JSON.parse(str || 'null') as TUser | null;
  }, []);

  const getProfileFn = useCallback(() => {
    return config.mode === 'fetch' ? config.useProfile : (_: HttpClient) => null;
  }, dependencies);

  const useProfile = getProfileFn();
  const profile = useProfile({ httpClient: config.httpClient, httpConfig: config.httpConfig });
  const [user, setUser] = useState<TUser | null>(profile);

  useEffect(() => {
    if (config.mode === 'fetch') return;
    const storage = config.storage || 'cookie';
    setUser(parseInitialUser(storage === 'cookie' ? cookies.get(config.key) : window[storage].getItem(config.key)));
  }, dependencies);

  return [user, setUser];
}

export function useHttpClient(authKey: string = 'authorization', config?: AxiosRequestConfig): UseHttpClient {
  const client = useMemo(() => axios.create(config), []);
  const { cookie, set } = useCookie<string>(authKey);
  const interceptors: Interceptors = useMemo(() => {
    return {
      request: {
        onFulfilled: (config: InternalAxiosRequestConfig<unknown>): InternalAxiosRequestConfig<unknown> => {
          if (typeof window === 'undefined') return config;
          if (!!cookie) config.headers.setAuthorization(`Bearer ${cookie}`);
          return { ...config, withCredentials: true };
        },
      },
      response: {
        onFulfilled: (response: AxiosResponse<unknown, unknown>): AxiosResponse<unknown, unknown> => {
          if (typeof window === 'undefined') return response;
          const value = response.headers[authKey.toLowerCase()]?.split(' ')?.pop();
          if (value) set(value, 365 * 150);
          return response;
        },
      },
    };
  }, []);

  useEffect(() => {
    client.interceptors.request.use(
      interceptors.request.onFulfilled,
      interceptors.request.onRejected,
      interceptors.request.options
    );
    client.interceptors.response.use(
      interceptors.response.onFulfilled,
      interceptors.response.onRejected,
      interceptors.response.options
    );
  }, []);

  return { client, interceptors };
}

type UseConfigResult<TUser extends DefaultUser = DefaultUser> = {
  keys: {
    dataKey: string;
    authKey: string;
  };
  initialUserConfig: UserProviderMode<TUser>;
  httpClientConfig: HttpClient;
  extractUrl: (provider: Provider) => string;
};

type UseInitialUserResult<TUser extends DefaultUser = DefaultUser> = [
  TUser | null,
  React.Dispatch<React.SetStateAction<TUser | null>>
];

type UseHttpClient = {
  client: AxiosInstance;
  interceptors: Interceptors;
};
