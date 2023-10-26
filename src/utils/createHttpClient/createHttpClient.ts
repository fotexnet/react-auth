import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
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

    client.interceptors.response.use(
      (response: AxiosResponse<unknown, unknown>): AxiosResponse<unknown, unknown> => {
        const value = response.headers[authKey.toLowerCase()]?.split(' ')?.pop();
        if (value) cookies.set(authKey, value, 365);
        return response;
      }
    );
  }

  return client;
}

export default createHttpClient();
