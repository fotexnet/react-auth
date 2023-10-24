import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import IResponse from '../../interfaces/IResponse';
import { DatabaseRecord, HttpClient, Prettify } from '../../interfaces/Record';
import cookies from '../cookies/cookies';

type LocalProvider = 'local';
type SocialProvider = 'google' | 'facebook';
type SocialPayload = Prettify<SocialCredentials & { social_provider: string }>;
type AuthResponse<TUser extends DatabaseRecord> = IResponse<{ [x: string]: TUser }>;

export type AuthenticatedUser<TProps extends DatabaseRecord> = { token: string } & TProps;

export type Credentials = Prettify<LocalCredentials | SocialCredentials>;
export type LocalCredentials = { email: string; password: string };
export type SocialCredentials = { social_token: string };

export type Provider = LocalProvider | SocialProvider;

export type LoginConfig = Prettify<{ apiUrl: string } & LoginKeys & LoginProvider & HttpClient>;
export type LoginKeys = { dataKey: string; authKey?: string };
export type LoginProvider =
  | { provider: LocalProvider; credentials: LocalCredentials }
  | { provider: SocialProvider; credentials: SocialCredentials };

/**
 * Provides an easy way to get an access token for the `fotexnet` infrastructure.
 * Define the login endpoint via `apiUrl`, the `dataKey` which will be used to identify the user object
 * and a `provider` method as well as the associated `credentials` info.
 *
 * @param config Login configuration
 * @returns User object with an access token
 */
async function login<TRecord extends DatabaseRecord = DatabaseRecord>(
  config: LoginConfig
): Promise<AuthenticatedUser<TRecord>> {
  const client: AxiosInstance = config.httpClient || axios;
  const payload: LocalCredentials | SocialPayload =
    config.provider === 'local' ? config.credentials : { ...config.credentials, social_provider: config.provider };

  const conf = { ...config.httpConfig, withCredentials: true } as AxiosRequestConfig<unknown>;
  const response = await client.post<AuthResponse<TRecord>>(config.apiUrl, payload, conf);
  const res = response as AxiosResponse<AuthResponse<TRecord>, unknown>;

  const user = res.data.data[config.dataKey];
  const authKey = config.authKey || 'authorization';
  const token = res.headers[authKey]?.split(' ')[1] || null;
  cookies.set(config.dataKey, JSON.stringify(user), 365);
  cookies.set(authKey, token, 365);

  return { ...user, token };
}

export default login;

export function isLocalCredentials(credentials: Credentials): credentials is LocalCredentials {
  return credentials.hasOwnProperty('email') && credentials.hasOwnProperty('password');
}

export function isSocialCredentials(credentials: Credentials): credentials is SocialCredentials {
  return credentials.hasOwnProperty('social_token');
}
