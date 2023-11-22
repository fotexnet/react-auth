import { AxiosRequestConfig, isAxiosError } from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HttpClient, Prettify } from '../../interfaces/Record';
import cookies, { parseCookie } from '../../utils/cookies/cookies';
import client from '../../utils/createHttpClient/createHttpClient';
import login, { AuthResponse, LoginProvider, Provider } from '../../utils/login/login';
import { DefaultUser, UserProviderConfig, UserProviderFactory, UserObject, AuthGuardConfig } from './types';
import { parseJwt } from '../../utils/parseJwt/parseJwt';
import { hasExpired } from '../../utils/hasExpired/hasExpired';

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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
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
        setLoading(false)
        return;
      }

      const { exp } = parseJwt(token);

      const isExpired = hasExpired(exp);

      if(!isExpired){
        setLoading(false)
      }
      const fetchToken = async () => {
        try {
          setIsLoading(true)
          const conf = {
            headers: { Authorization: `Bearer ${token}`, TokenRefresh: 1 },
            withCredentials: true,
          } as AxiosRequestConfig<unknown>;
          const response = await http.get<AuthResponse<TUser>>(profileUrl, conf);
          if(response){
            const newToken = response.headers[authKey.toLowerCase()]?.split(' ')?.pop()
            if (newToken) cookies.set(authKey, newToken, 365);
          }
        } catch (err: any) {
          if (isAxiosError(err) && err?.response?.status === 401) {
            cookies.delete(authKey);
            cookies.delete(dataKey);
            setUser(null);
          }
        } finally {
          setIsLoading(false)
          setLoading(false)
        }
      };

      if (isExpired && !isLoading) {
        void fetchToken();
      }

      setReTrigger(false)
      setUser(cachedUser);
    }, [reTrigger]);

    useEffect(() => {
      const checkCookieExpiration = () => {
        const token = parseCookie<string>(cookies.get(authKey));

        if (token) {
          const { exp } = parseJwt(token);

          const isExpired = hasExpired(exp);

          if (isExpired) {
            setReTrigger(true)
          }
        }
      };

      // Initial check when the component mounts
      checkCookieExpiration();

      // Check the cookie expiration every 5 seconds (adjust as needed)
      const intervalId = setInterval(checkCookieExpiration, 2500);

      // Clean up the interval when the component unmounts
      return () => clearInterval(intervalId);
    }, []);

    return (
      <UserContext.Provider
        value={{
          user,
          loading,
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
