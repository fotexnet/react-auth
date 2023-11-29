import axios, { AxiosRequestConfig, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import cookies from '../cookies/cookies';

export function createHttpClient(authKey: string = 'authorization', config?: AxiosRequestConfig): AxiosInstance {
  const client = axios.create(config);

  if (typeof document !== 'undefined') {
    const token = cookies.get(authKey);

    client.interceptors.request.use(
      (config: InternalAxiosRequestConfig<unknown>): InternalAxiosRequestConfig<unknown> => {
        if (!!token) config.headers[authKey] = `Bearer ${token}`;
        return { ...config, withCredentials: true };
      }
    );
  }

  return client;
}

export default createHttpClient();
