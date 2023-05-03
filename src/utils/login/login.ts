import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import IResponse from '../../interfaces/IResponse';

export type LocalCredentials = { email: string; password: string };
export type SocialCredentials = { social_token: string; social_provider: SocialProvider };
export type SocialProvider = 'google' | 'facebook';
export type LoginConfig = {
  dataKey: string;
  apiUrl: string;
  httpClient?: AxiosInstance;
  httpConfig?: AxiosRequestConfig;
} & (
  | { provider: 'local'; credentials: LocalCredentials }
  | { provider: SocialProvider; credentials: SocialCredentials }
);

type DatabaseRecord = { id: number } & Record<string, unknown>;
type AuthResponse<TUser extends DatabaseRecord> = IResponse<{ [x: string]: TUser }>;
type User<TProps extends DatabaseRecord> = { token: string } & TProps;

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
