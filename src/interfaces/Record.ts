import { AxiosInstance, AxiosRequestConfig } from 'axios';

export type DatabaseRecord = { id: number } & Record<string, unknown>;
export type HttpClient = { httpClient?: AxiosInstance; httpConfig?: Omit<AxiosRequestConfig, 'withCredentials'> };
export type Prettify<T extends Record<string, unknown>> = {
  [P in keyof T]: T[P];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};
