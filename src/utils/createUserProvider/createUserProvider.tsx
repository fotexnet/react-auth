import React, { createContext, useContext, useState } from 'react';
import { useCookies } from 'react-cookie';

export interface IUser {
  id: number;
  email: string;
}

export type UserObject<TUser extends IUser = IUser> = {
  user: TUser | null;
  set: (user: TUser) => void;
  unset: () => void;
};

export type UserProviderFactory<TUser extends IUser = IUser> = {
  UserProvider: React.FC<React.PropsWithChildren<unknown>>;
  useUser: () => UserObject<TUser>;
};

function createUserProvider<TUser extends IUser = IUser>(): UserProviderFactory<TUser> {
  const UserContext = createContext<UserObject<TUser> | null>(null);

  const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const [cookies] = useCookies<string, { default?: TUser }>();
    const [user, setUser] = useState<TUser | null>(() => cookies.default || null);

    return (
      <UserContext.Provider value={{ user, set: setUser, unset: () => setUser(null) }}>{children}</UserContext.Provider>
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
