import { AxiosRequestConfig, isAxiosError } from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HttpClient, Prettify } from '../../interfaces/Record';
import cookies, { parseCookie } from '../../utils/cookies/cookies';
import client from '../../utils/createHttpClient/createHttpClient';
import login, { AuthResponse, LoginProvider, Provider } from '../../utils/login/login';
import { DefaultUser, UserProviderConfig, UserProviderFactory, UserObject, AuthGuardConfig } from './types';

function createUserProvider<TUser extends DefaultUser = DefaultUser>({
  authKey = 'authorization',
  dataKey,
  httpClient,
  httpConfig,
  profileUrl,
  profileUpdateInterval = 300,
  ...config
}: UserProviderConfig): UserProviderFactory<TUser> {
  const UserContext = createContext<UserObject<TUser> | null>(null);
  const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const http = useMemo(() => httpClient || client, [httpClient]);
    const [user, setUser] = useState<TUser | null | undefined>(undefined);

    const extractLoginUrl = useCallback((provider: Provider) => {
      return config.localOnly ? config.loginUrl : provider === 'local' ? config.loginUrl.local : config.loginUrl.social;
    }, []);

    useEffect(() => {
      const token = parseCookie<string>(cookies.get(authKey));
      if (!token) return;

      const cachedUser = parseCookie<TUser>(cookies.get(dataKey)) || undefined;
      setUser(cachedUser);

      const fetchProfile = async () => {
        const conf = {
          headers: { Authorization: `Bearer ${token}`, ...httpConfig?.headers },
          withCredentials: true,
          ...httpConfig,
        } as AxiosRequestConfig<unknown>;
        const response = await http.get<AuthResponse<TUser>>(profileUrl, conf);
        cookies.set(dataKey, JSON.stringify(response.data.data[dataKey]), 365);
        setUser(response.data.data[dataKey]);
      };

      const interval = setInterval(() => {
        try {
          fetchProfile();
        } catch (err) {
          if (isAxiosError(err) && err.status === 401) setUser(null);
          else setUser(cachedUser);
        }
      }, profileUpdateInterval * 1000);

      return () => {
        clearInterval(interval);
      };
    }, []);

    useEffect(() => {
      if (user) return;
      cookies.delete(authKey);
      cookies.delete(dataKey);
    }, [user]);

    return (
      <UserContext.Provider
        value={{
          user,
          update: (data: Partial<TUser>) => {
            setUser(prev => ({ ...prev, ...data } as TUser));
          },
          login: async ({
            httpClient: hClient,
            httpConfig: hConfig,
            ...provider
          }: Prettify<LoginProvider & HttpClient>) => {
            const url: string = extractLoginUrl(provider.provider);
            const httpObj: HttpClient = {
              httpClient: hClient || http,
              httpConfig: hConfig || httpConfig,
            };
            const user = await login<TUser>({
              ...provider,
              ...httpObj,
              dataKey,
              authKey,
              apiUrl: url,
            });
            setUser(user);
            return user;
          },
          logout: async (_http?: HttpClient) => {
            const hClient = _http?.httpClient || http;
            const hConfig = (_http?.httpConfig || httpConfig || {}) as AxiosRequestConfig;
            hConfig.withCredentials = true;
            try {
              await hClient.post(config.logoutUrl, undefined, hConfig);
            } finally {
              cookies.delete(dataKey);
              cookies.delete(authKey);
              setUser(null);
            }
          },
        }}
      >
        {children}
      </UserContext.Provider>
    );
  };

  const useUser = (): UserObject<TUser> => {
    const context = useContext(UserContext);
    if (context === null) throw new Error('User provider required!');
    return context;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withAuthGuard = (Component: React.ComponentType<any>, config: AuthGuardConfig): React.FC<any> => {
    const useExceptionHook = config.useException ? config.useException : () => false;

    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    return function AuthGuard(props) {
      const [status, setStatus] = useState<number | null>(null);
      const { user } = useUser();
      const redirect = config.useRedirect();
      const hasException = useExceptionHook();

      // TODO: include 'acceptRoles' in condition
      useEffect(() => {
        if (!!user) setStatus(200);
        else if (user === null) setStatus(401);
        else setStatus(null);

        return () => {
          setStatus(null);
        };
      }, [user]);

      useEffect(() => {
        if (!hasException && status === 401) {
          redirect();
        }
      }, [hasException, redirect, status]);

      return <Component {...props} />;
    };
  };

  return { UserProvider, useUser, withAuthGuard };
}

export default createUserProvider;
