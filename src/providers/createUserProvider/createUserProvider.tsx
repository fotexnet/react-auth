import { AxiosRequestConfig } from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { HttpClient, Prettify } from '../../interfaces/Record';
import cookies, { parseCookie } from '../../utils/cookies/cookies';
import client from '../../utils/createHttpClient/createHttpClient';
import fetchToken from '../../utils/fetchToken/fetchToken';
import { hasExpired } from '../../utils/hasExpired/hasExpired';
import login, { LoginProvider, Provider } from '../../utils/login/login';
import { parseJwt } from '../../utils/parseJwt/parseJwt';
import { AuthGuardConfig, DefaultUser, UserObject, UserProviderConfig, UserProviderFactory } from './types';

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
    const http = httpClient ? httpClient : client;
    const [user, setUser] = useState<TUser | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean | null>(true);
    const [reTrigger, setReTrigger] = useState<boolean>(false);

    const extractLoginUrl = useCallback((provider: Provider) => {
      return config.localOnly ? config.loginUrl : provider === 'local' ? config.loginUrl.local : config.loginUrl.social;
    }, []);

    useEffect(() => {
      const token = parseCookie<string>(cookies.get(authKey));
      const cachedUser = parseCookie<TUser>(cookies.get(dataKey)) || undefined;

      if (!token || !cachedUser) {
        cookies.delete(authKey);
        cookies.delete(dataKey);
        setLoading(false);
        return;
      }

      const { exp } = parseJwt(token);

      const isExpired = hasExpired(exp);

      if (!isExpired) {
        setLoading(false);
      }

      if (isExpired && !isLoading) {
        void fetchToken({
          dataKey,
          authKey,
          profileUrl,
          token,
          initialFunc: () => setIsLoading(true),
          catchFunc: () => setUser(null),
          finallyFunc: () => {
            setIsLoading(false);
            setLoading(false);
          },
        });
      }

      setReTrigger(false);
      setUser(cachedUser);
    }, [reTrigger]);

    useEffect(() => {
      const checkCookieExpiration = () => {
        const token = parseCookie<string>(cookies.get(authKey));

        if (token) {
          const { exp } = parseJwt(token);

          const isExpired = hasExpired(exp);

          if (isExpired) {
            setReTrigger(true);
          }
        }
      };

      // Check the cookie expiration every 2.5 seconds
      const intervalId = setInterval(checkCookieExpiration, 2500);

      return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          const token = parseCookie<string>(cookies.get(authKey));

          if (user) {
            void fetchToken({
              dataKey,
              authKey,
              profileUrl,
              token: token!,
              initialFunc: () => setIsLoading(true),
              catchFunc: () => setUser(null),
              finallyFunc: () => {
                setIsLoading(false);
                setLoading(false);
              },
            });
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [user]);

    return (
      <UserContext.Provider
        value={{
          user,
          loading,
          update: (data: Partial<TUser>) => {
            setUser(prev => ({ ...prev, ...data } as TUser));
          },
          remove: () => {
            cookies.delete(authKey);
            cookies.delete(dataKey);
            setUser(null);
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
              setUser(undefined);
              setLoading(null);
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
