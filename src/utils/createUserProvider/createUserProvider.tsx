import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { HttpClient } from '../../interfaces/Record';
import cookies from '../cookies/cookies';
import login, { LoginConfig, LoginProvider } from '../login/login';

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

export type UserProviderConfig<TUser extends IUser = IUser> = {
  loginUrl: string;
  logoutUrl: string;
} & UserProviderMode<TUser> &
  Pick<LoginConfig, 'dataKey'> &
  HttpClient;

type UserProviderMode<TUser extends IUser = IUser> =
  | { mode: 'storage'; storage: 'localStorage' | 'sessionStorage' | 'cookie'; key: string }
  | { mode: 'fetch'; useFetch: (http: HttpClient) => TUser | null };

export type UserProviderFactory<TUser extends IUser = IUser> = {
  UserProvider: React.FC<React.PropsWithChildren<unknown>>;
  useUser: () => UserObject<TUser>;
};

function createUserProvider<TUser extends IUser = IUser>({
  dataKey,
  loginUrl,
  logoutUrl,
  httpClient,
  httpConfig,
  ...config
}: UserProviderConfig<TUser>): UserProviderFactory<TUser> {
  const UserContext = createContext<UserObject<TUser> | null>(null);
  const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const [user, setUser] = useInitialUser<TUser>({ ...config, httpClient, httpConfig });
    return (
      <UserContext.Provider
        value={{
          user,
          update: setUser,
          login: async ({ httpClient: client, httpConfig: config, ...provider }: LoginProvider & HttpClient) => {
            const user = await login<TUser>({
              ...provider,
              apiUrl: loginUrl,
              dataKey,
              httpClient: client || httpClient,
              httpConfig: config || httpConfig,
            });
            setUser(user);
            return user;
          },
          logout: async (http?: HttpClient) => {
            const client = http?.httpClient || axios;
            await client.post(logoutUrl, undefined, { ...http?.httpConfig, withCredentials: true });
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
        setUser(config.useFetch({ httpClient: config.httpClient, httpConfig: config.httpConfig }));
        break;
      default:
        break;
    }
  }, []);

  return [user, setUser];
}
