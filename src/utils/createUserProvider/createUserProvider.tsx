import React, { createContext, useContext, useEffect, useState } from 'react';
import cookies from '../cookies/cookies';
import login, { LoginConfig } from '../login/login';

export interface IUser extends Record<string, unknown> {
  id: number;
  email: string;
}

export type UserObject<TUser extends IUser = IUser> = {
  user: TUser | null;
  update: (user: TUser) => void;
  login: (config: LoginConfig) => Promise<TUser>;
  logout: () => void;
};

export type UserProviderConfig<TUser extends IUser = IUser> =
  | { mode: 'storage'; storage: 'localStorage' | 'sessionStorage' | 'cookie'; key: string }
  | { mode: 'fetch'; useFetch: () => Promise<TUser> };

export type UserProviderFactory<TUser extends IUser = IUser> = {
  UserProvider: React.FC<React.PropsWithChildren<unknown>>;
  useUser: () => UserObject<TUser>;
};

function createUserProvider<TUser extends IUser = IUser>(
  config: UserProviderConfig<TUser>
): UserProviderFactory<TUser> {
  const UserContext = createContext<UserObject<TUser> | null>(null);
  const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const [user, setUser] = useInitialUser<TUser>(config);
    return (
      <UserContext.Provider
        value={{
          user,
          update: setUser,
          login: async (config: LoginConfig) => {
            const user = await login<TUser>(config);
            setUser(user);
            return user;
          },
          logout: () => {
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
  config: UserProviderConfig<TUser>
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
        config.useFetch().then(setUser);
        break;
      default:
        break;
    }
  }, []);

  return [user, setUser];
}
