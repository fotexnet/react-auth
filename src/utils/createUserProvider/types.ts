import { AxiosInterceptorManager, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpClient } from '../../interfaces/Record';
import { LoginProvider, LoginKeys } from '../login/login';

export type User = { id: number; email: string } & Record<string, unknown>;

export type UserObject<TUser extends User = User> = {
  user: TUser | null;
  update: (user: Partial<TUser>) => void;
  login: (config: LoginProvider & HttpClient) => Promise<TUser>;
  logout: (config?: HttpClient) => Promise<void>;
};

export type UserProviderConfig<TUser extends User = User> = UserProviderUrls &
  UserProviderMode<TUser> &
  LoginKeys &
  HttpClient;

export type UserProviderUrls = { logoutUrl: string } & (
  | { loginUrl: string; localOnly: true }
  | { loginUrl: { local: string; social: string }; localOnly: false }
);

export type UserProviderMode<TUser extends User = User> =
  | { mode: 'storage'; key: string; storage?: 'localStorage' | 'sessionStorage' | 'cookie' }
  | { mode: 'fetch'; useProfile: (http: HttpClient) => TUser | null };

export type UserProviderFactory<TUser extends User = User> = {
  UserProvider: React.FC<React.PropsWithChildren<unknown>>;
  useUser: () => UserObject<TUser>;
  meta: {
    interceptors: Interceptors;
  };
};

export type Interceptors = {
  request: RequestInterceptor<InternalAxiosRequestConfig>;
  response: RequestInterceptor<AxiosResponse>;
};
type InterceptorArguments<TData = unknown> = Parameters<AxiosInterceptorManager<TData>['use']>;
type RequestInterceptor<TData = unknown> = {
  onFulfilled?: InterceptorArguments<TData>[0];
  onRejected?: InterceptorArguments<TData>[1];
  options?: InterceptorArguments<TData>[2];
};
