import React, { createContext, useContext, useEffect, useState } from 'react';
import cookies from '../cookies/cookies';

export interface IUser {
  id: number;
  email: string;
}

export type UserObject<TUser extends IUser = IUser> = {
  user: TUser | null;
  set: (user: TUser) => void;
  unset: () => void;
};

export type UserProviderConfig<TUser extends IUser = IUser> =
  | { mode: 'storage'; storage: Storage | typeof document.cookie; key: string }
  | { mode: 'fetch'; useFetch: () => Promise<TUser> };

export type UserProviderFactory<TUser extends IUser = IUser> = {
  UserProvider: React.FC<React.PropsWithChildren<unknown>>;
  useUser: () => UserObject<TUser>;
};

// TODO: create useCookie hook
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
          set: setUser,
          unset: () => {
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
          parseInitialUser(isStorage(config.storage) ? config.storage.getItem(config.key) : cookies.get(config.key))
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

function isStorage(storage: unknown): storage is Storage {
  return storage === window.localStorage || storage === window.sessionStorage;
}
