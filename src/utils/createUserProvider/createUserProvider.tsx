import { createHttpClient } from '@fotexnet/react-request';
import React, { createContext, useContext } from 'react';
import { HttpClient } from '../../interfaces/Record';
import cookies from '../cookies/cookies';
import login, { LoginProvider } from '../login/login';
import createInterceptors from './createInterceptors';
import { IUser, UserProviderConfig, UserProviderFactory, UserObject } from './types';
import { useConfig, useInitialUser } from './utils';

// TODO: update user based on deps
function createUserProvider<TUser extends IUser = IUser>(
  config: UserProviderConfig<TUser>
): UserProviderFactory<TUser> {
  const interceptors = createInterceptors(config.authKey);
  const { client } = createHttpClient({ ...interceptors });
  const UserContext = createContext<UserObject<TUser> | null>(null);
  const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const { initialUserConfig, httpClientConfig, keys, extractUrl } = useConfig(config);
    const [user, setUser] = useInitialUser<TUser>({ ...initialUserConfig, ...httpClientConfig });

    return (
      <UserContext.Provider
        value={{
          user,
          update: setUser,
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
            const httpConfig = http?.httpConfig || httpClientConfig.httpConfig;
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

  return {
    UserProvider,
    useUser,
    meta: { interceptors },
  };
}

export default createUserProvider;
