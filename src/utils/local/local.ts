import axios, { AxiosInstance } from 'axios';
import IResponse from '../../interfaces/IResponse';

export type Credentials = { email: string; password: string };
export type LoginOptions = { key: string; httpClient?: AxiosInstance };

type DatabaseRecord = { id: number } & Record<string, unknown>;
type AuthResponse<TUser extends DatabaseRecord> = IResponse<{ [x: string]: TUser }>;
type User<TProps extends DatabaseRecord> = { token: string } & TProps;

async function local<TRecord extends DatabaseRecord = DatabaseRecord>(
  apiUrl: string,
  credentials: Credentials,
  config: LoginOptions
): Promise<User<TRecord> | null> {
  const http = config.httpClient || axios;

  try {
    const { data, headers } = await http.post<AuthResponse<TRecord>>(apiUrl, credentials, { withCredentials: true });
    const user = data.data[config.key];
    const token = headers.authorization?.split(' ')[1];
    return { ...user, token };
  } catch (error) {
    return null;
  }
}

export default local;
