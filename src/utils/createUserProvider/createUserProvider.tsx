import { AxiosRequestConfig } from 'axios';
import React, { createContext, useContext } from 'react';
import { HttpClient } from '../../interfaces/Record';
import cookies from '../cookies/cookies';
import client from '../createHttpClient/createHttpClient';
import login, { LoginProvider } from '../login/login';
import { DefaultUser, UserProviderConfig, UserProviderFactory, UserObject } from './types';
import { useConfig, useInitialUser } from './utils';

function createUserProvider<TUser extends DefaultUser = DefaultUser>(
  config: UserProviderConfig<TUser>
): UserProviderFactory<TUser> {
  const UserContext = createContext<UserObject<TUser> | null>(null);
  const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const { initialUserConfig, httpClientConfig, keys, extractUrl } = useConfig(config);
    const [user, setUser] = useInitialUser<TUser>({ ...initialUserConfig, ...httpClientConfig });

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
              httpClient: hClient || httpClientConfig.httpClient || client,
              httpConfig: hConfig || httpClientConfig.httpConfig,
            };
            const user = await login<TUser>({ ...provider, ...keys, ...httpObj, apiUrl });
            setUser(user);
            return user;
          },
          logout: async (http?: HttpClient) => {
            const httpClient = http?.httpClient || httpClientConfig.httpClient || client;
            const httpConfig = (http?.httpConfig || httpClientConfig.httpConfig || {}) as AxiosRequestConfig;
            httpConfig.withCredentials = true;
            await httpClient.post(config.logoutUrl, undefined, httpConfig);
            setUser(null);
            cookies.delete(keys.authKey);
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

  return { UserProvider, useUser };
}

export default createUserProvider;
