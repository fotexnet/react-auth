import { HttpClientConfig } from '@fotexnet/react-request';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import cookies, { createCookieName } from '../cookies/cookies';

function createInterceptors(authKey: string = 'authorization'): HttpClientConfig {
  return {
    outgoingRequestInterceptors: [
      {
        onFulfilled: (config: InternalAxiosRequestConfig<unknown>): InternalAxiosRequestConfig<unknown> => {
          if (typeof window === 'undefined') return config;

          const token = cookies.get('authorization');
          if (!!token) config.headers.setAuthorization(`Bearer ${token}`);

          return { ...config, withCredentials: true };
        },
      },
    ],
    incomingRequestInterceptors: [
      {
        onFulfilled: (response: AxiosResponse<unknown, unknown>): AxiosResponse<unknown, unknown> => {
          if (typeof window === 'undefined') return response;

          const cookie = createCookieName(authKey);
          const value = response.headers[authKey.toLowerCase()]?.split(' ')?.pop();
          if (value) cookies.set(cookie, value, 365 * 150);

          return response;
        },
      },
    ],
  };
}

export default createInterceptors;
