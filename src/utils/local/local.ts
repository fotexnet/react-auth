import axios from 'axios';
import { v4 as uuid } from 'uuid';
import IResponse from '../../interfaces/IResponse';

export type Credentials = { email: string; password: string };
export type LoginOptions = { cacheUrl?: string };

type DatabaseRecord = { id: number } & Record<string, unknown>;
type AuthResponse<TUser extends DatabaseRecord> = IResponse<{ [x: string]: TUser }>;
type User<TProps extends DatabaseRecord> = { token: string } & TProps;

function local<TRecord extends DatabaseRecord = DatabaseRecord>(apiUrl: string, credentials: Credentials) {
  return async (key: string, options?: LoginOptions): Promise<User<TRecord> | null> => {
    try {
      const { data, headers } = await axios.post<AuthResponse<TRecord>>(apiUrl, credentials, { withCredentials: true });
      const cacheId = createCache();
      const user = data.data[key];
      const token = headers.authorization?.split(' ')[1];

      if (!!options?.cacheUrl) axios.post(options?.cacheUrl, { [key]: user, token });

      return { ...user, token, cacheId };
    } catch (error) {
      return null;
    }
  };
}

export default local;

function createCache(): string {
  const cacheId = uuid();
  if (typeof window !== 'undefined') window.localStorage.setItem('cache_id', cacheId);
  return cacheId;
}
