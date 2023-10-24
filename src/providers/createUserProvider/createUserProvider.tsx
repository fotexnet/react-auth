import { AxiosRequestConfig } from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { HttpClient } from '../../interfaces/Record';
import cookies from '../../utils/cookies/cookies';
import client from '../../utils/createHttpClient/createHttpClient';
import login, { LoginProvider, Provider } from '../../utils/login/login';
import { DefaultUser, UserProviderConfig, UserProviderFactory, UserObject, AuthGuardConfig } from './types';

function createUserProvider<TUser extends DefaultUser = DefaultUser>({
  authKey = 'authorization',
  dataKey,
  httpClient,
  httpConfig,
  useProfile,
  ...config
}: UserProviderConfig<TUser>): UserProviderFactory<TUser> {
  const UserContext = createContext<UserObject<TUser> | null>(null);
  const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const profile = useProfile();
    const [user, setUser] = useState<TUser | null>(profile);

    const parseInitialUser = useCallback((str?: string | null) => {
      return JSON.parse(str || 'null') as TUser | null;
    }, []);

    const extractUrl = useCallback((provider: Provider) => {
      return config.localOnly ? config.loginUrl : provider === 'local' ? config.loginUrl.local : config.loginUrl.social;
    }, []);

    useEffect(() => {
      setUser(parseInitialUser(cookies.get(dataKey)));
    }, []);

    useEffect(() => {
      if (!profile) return;
      cookies.set(dataKey, JSON.stringify(profile), 365);
      setUser(profile);
    }, [profile]);

    return (
      <UserContext.Provider
        value={{
          user,
          update: (data: Partial<TUser>) => {
            setUser(prev => ({ ...prev, ...data } as TUser));
          },
          login: async ({ httpClient: hClient, httpConfig: hConfig, ...provider }: LoginProvider & HttpClient) => {
            const apiUrl: string = extractUrl(provider.provider);
            const httpObj: HttpClient = {
              httpClient: hClient || httpClient || client,
              httpConfig: hConfig || httpConfig,
            };
            const user = await login<TUser>({
              ...provider,
              ...httpObj,
              dataKey,
              authKey,
              apiUrl,
            });
            setUser(user);
            return user;
          },
          logout: async (_http?: HttpClient) => {
            const hClient = _http?.httpClient || httpClient || client;
            const hConfig = (_http?.httpConfig || httpConfig || {}) as AxiosRequestConfig;
            hConfig.withCredentials = true;
            await hClient.post(config.logoutUrl, undefined, hConfig);
            setUser(null);
            cookies.delete(dataKey);
            cookies.delete(authKey);
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
        if (!user) setStatus(401);
        else setStatus(200);
        return () => {
          setStatus(null);
        };
      }, [user]);

      useEffect(() => {
        if (!hasException && ![200, null].includes(status)) {
          redirect();
        }
      }, [hasException, redirect, status]);

      return <Component {...props} />;
    };
  };

  return { UserProvider, useUser, withAuthGuard };
}

export default createUserProvider;
