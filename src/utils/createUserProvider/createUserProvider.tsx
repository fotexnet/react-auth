import axios from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HttpClient } from '../../interfaces/Record';
import cookies from '../cookies/cookies';
import login, { LoginConfig, LoginProvider, Provider } from '../login/login';

export interface IUser extends Record<string, unknown> {
  id: number;
  email: string;
}

export type UserObject<TUser extends IUser = IUser> = {
  user: TUser | null;
  update: (user: TUser) => void;
  login: (config: LoginProvider & HttpClient) => Promise<TUser>;
  logout: (config?: HttpClient) => Promise<void>;
};

export type UserProviderConfig<TUser extends IUser = IUser> = UserProviderUrls &
  UserProviderMode<TUser> &
  Pick<LoginConfig, 'dataKey'> &
  HttpClient;

export type UserProviderUrls = { logoutUrl: string } & (
  | { loginUrl: string; localOnly: true }
  | { loginUrl: { local: string; social: string }; localOnly: false }
);

export type UserProviderMode<TUser extends IUser = IUser> =
  | { mode: 'storage'; storage: 'localStorage' | 'sessionStorage' | 'cookie'; key: string }
  | { mode: 'fetch'; useProfile: (http: HttpClient) => TUser | null };

export type UserProviderFactory<TUser extends IUser = IUser> = {
  UserProvider: React.FC<React.PropsWithChildren<unknown>>;
  useUser: () => UserObject<TUser>;
};

function createUserProvider<TUser extends IUser = IUser>(
  config: UserProviderConfig<TUser>
): UserProviderFactory<TUser> {
  const UserContext = createContext<UserObject<TUser> | null>(null);
  const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const { initialUserConfig, httpClientConfig, dataKey, extractUrl } = useConfig(config);
    const [user, setUser] = useInitialUser<TUser>({ ...initialUserConfig, ...httpClientConfig });

    return (
      <UserContext.Provider
        value={{
          user,
          update: setUser,
          login: async ({ httpClient: hClient, httpConfig: hConfig, ...provider }: LoginProvider & HttpClient) => {
            const apiUrl: string = extractUrl(provider.provider);
            const httpObj: HttpClient = {
              httpClient: hClient || httpClientConfig.httpClient,
              httpConfig: hConfig || httpClientConfig.httpConfig,
            };
            const user = await login<TUser>({ ...provider, ...httpObj, apiUrl, dataKey });
            setUser(user);
            return user;
          },
          logout: async (http?: HttpClient) => {
            const httpClient = http?.httpClient || httpClientConfig.httpClient || axios;
            const httpConfig = http?.httpConfig || httpClientConfig.httpConfig;
            await httpClient.post(config.logoutUrl, undefined, { ...httpConfig, withCredentials: true });
            setUser(null);
            cookies.delete('authorization');
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

function useConfig<TUser extends IUser = IUser>(config: UserProviderConfig<TUser>) {
  const dataKey = useMemo(() => config.dataKey, []);
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

  return { dataKey, initialUserConfig, httpClientConfig, extractUrl };
}

// TODO: set user if mode set to storage (?)
function useInitialUser<TUser extends IUser = IUser>(
  config: UserProviderMode<TUser> & HttpClient
): [TUser | null, React.Dispatch<React.SetStateAction<TUser | null>>] {
  const [user, setUser] = useState<TUser | null>(null);

  useEffect(() => {
    const parseInitialUser = (str?: string | null) => JSON.parse(str || 'null') as TUser | null;
    switch (config.mode) {
      case 'storage':
        setUser(
          parseInitialUser(
            config.storage === 'cookie' ? cookies.get(config.key) : window[config.storage].getItem(config.key)
          )
        );
        break;
      case 'fetch':
        setUser(config.useProfile({ httpClient: config.httpClient, httpConfig: config.httpConfig }));
        break;
      default:
        break;
    }
  }, []);

  return [user, setUser];
}
