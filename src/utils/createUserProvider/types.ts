import { AxiosInterceptorManager, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { DatabaseRecord, HttpClient } from '../../interfaces/Record';
import { LoginProvider, LoginKeys } from '../login/login';

export type DefaultUser = { email: string } & DatabaseRecord;

export type UserObject<TUser extends DefaultUser = DefaultUser> = {
  user: TUser | null;
  update: (user: Partial<TUser>) => void;
  login: (config: LoginProvider & HttpClient) => Promise<TUser>;
  logout: (config?: HttpClient) => Promise<void>;
};

export type UserProviderConfig<TUser extends DefaultUser = DefaultUser> = UserProviderUrls &
  UserProviderMode<TUser> &
  LoginKeys &
  HttpClient;

export type UserProviderUrls = { logoutUrl: string } & (
  | { loginUrl: string; localOnly: true }
  | { loginUrl: { local: string; social: string }; localOnly: false }
);

export type UserProviderMode<TUser extends DefaultUser = DefaultUser> =
  | { mode: 'storage'; key: string; storage?: 'localStorage' | 'sessionStorage' | 'cookie' }
  | { mode: 'fetch'; useProfile: (http: HttpClient) => TUser | null };

export type UserProviderFactory<TUser extends DefaultUser = DefaultUser> = {
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
