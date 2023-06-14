import { HttpClientConfig } from '@fotexnet/react-request';
import { HttpClient } from '../../interfaces/Record';
import { LoginProvider, LoginKeys } from '../login/login';

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
  LoginKeys &
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
  meta: {
    interceptors: HttpClientConfig;
  };
};
