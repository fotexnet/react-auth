import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import IResponse from '../../interfaces/IResponse';

export type Credentials = LocalCredentials | SocialCredentials;
export type Provider = LocalProvider | SocialProvider;
export type LoginConfig = {
  dataKey: string;
  apiUrl: string;
  httpClient?: AxiosInstance;
  httpConfig?: AxiosRequestConfig;
} & (
  | { provider: LocalProvider; credentials: LocalCredentials }
  | { provider: SocialProvider; credentials: SocialCredentials }
);

type LocalProvider = 'local';
type LocalCredentials = { email: string; password: string };

type SocialProvider = 'google' | 'facebook';
type SocialCredentials = { social_token: string; social_provider: SocialProvider };

type DatabaseRecord = { id: number } & Record<string, unknown>;
type AuthResponse<TUser extends DatabaseRecord> = IResponse<{ [x: string]: TUser }>;

export type User<TProps extends DatabaseRecord> = { token: string } & TProps;

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
): Promise<User<TRecord> | null> {
  const client = config.httpClient || axios;
  try {
    const { data, headers } = await client.post<AuthResponse<TRecord>>(
      config.apiUrl,
      config.credentials,
      config.httpConfig
    );
    const user = data.data[config.dataKey];
    const token = headers.authorization?.split(' ')[1];
    return { ...user, token };
  } catch (error) {
    return null;
  }
}

export default login;
