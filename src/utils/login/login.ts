import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import IResponse from '../../interfaces/IResponse';
import { DatabaseRecord } from '../../interfaces/Record';
import cookies from '../cookies/cookies';

type LocalProvider = 'local';
type SocialProvider = 'google' | 'facebook';
type SocialPayload = SocialCredentials & { social_provider: string };
type AuthResponse<TUser extends DatabaseRecord> = IResponse<{ [x: string]: TUser }>;

export type User<TProps extends DatabaseRecord> = { token: string } & TProps;

export type Credentials = LocalCredentials | SocialCredentials;
export type LocalCredentials = { email: string; password: string };
export type SocialCredentials = { social_token: string };

export type Provider = LocalProvider | SocialProvider;

export type LoginConfig = {
  dataKey: string;
  apiUrl: string;
  httpClient?: AxiosInstance;
  httpConfig?: Omit<AxiosRequestConfig, 'withCredentials'>;
} & (
  | { provider: LocalProvider; credentials: LocalCredentials }
  | { provider: SocialProvider; credentials: SocialCredentials }
);

/**
 * Provides an easy way to get an access token for the `fotexnet` infrastructure.
 * Define the login endpoint via `apiUrl`, the `dataKey` which will be used to identify the user object
 * and a `provider` method as well as the associated `credentials` info.
 *
 * @param config Login configuration
 * @returns User object with an access token
 */
async function login<TRecord extends DatabaseRecord = DatabaseRecord>(config: LoginConfig): Promise<User<TRecord>> {
  const client: AxiosInstance = config.httpClient || axios;
  const payload: LocalCredentials | SocialPayload =
    config.provider === 'local' ? config.credentials : { ...config.credentials, social_provider: config.provider };

  const { data, headers } = await client.post<AuthResponse<TRecord>>(config.apiUrl, payload, {
    ...config.httpConfig,
    withCredentials: true,
  });
  const user = data.data[config.dataKey];
  const token = headers.authorization?.split(' ')[1];
  cookies.set('Authorization', token, 365 * 1000);
  return { ...user, token };
}

export default login;

export function isLocalCredentials(credentials: Credentials): credentials is LocalCredentials {
  return credentials.hasOwnProperty('email') && credentials.hasOwnProperty('password');
}

export function isSocialCredentials(credentials: Credentials): credentials is SocialCredentials {
  return credentials.hasOwnProperty('social_token');
}
