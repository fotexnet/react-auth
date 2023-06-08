import { AxiosInstance, AxiosRequestConfig } from 'axios';

export type DatabaseRecord = { id: number } & Record<string, unknown>;
export type HttpClient = { httpClient?: AxiosInstance; httpConfig?: Omit<AxiosRequestConfig, 'withCredentials'> };
