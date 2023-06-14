import { useMemo, useCallback, useState, useEffect } from 'react';
import { HttpClient } from '../../interfaces/Record';
import cookies from '../cookies/cookies';
import { Provider } from '../login/login';
import { IUser, UserProviderConfig, UserProviderMode } from './types';

export function useConfig<TUser extends IUser = IUser>(config: UserProviderConfig<TUser>): UseConfigResult<TUser> {
  const keys = useMemo(() => ({ dataKey: config.dataKey, authKey: config.authKey || 'authorization' }), []);
  const initialUserConfig: UserProviderMode<TUser> = useMemo(() => {
    return config.mode === 'fetch'
      ? { mode: config.mode, useProfile: config.useProfile }
      : { mode: config.mode, storage: config.storage, key: config.key };
  }, []);
  const httpClientConfig: HttpClient = useMemo(() => {
    return { httpClient: config.httpClient, httpConfig: config.httpConfig };
  }, []);
  const extractUrl = useCallback((provider: Provider) => {
    return config.localOnly ? config.loginUrl : provider === 'local' ? config.loginUrl.local : config.loginUrl.social;
  }, []);

  return { keys, initialUserConfig, httpClientConfig, extractUrl };
}

// TODO: set user if mode set to storage (?)
export function useInitialUser<TUser extends IUser = IUser>(
  config: UserProviderMode<TUser> & HttpClient
): UseInitialUserResult<TUser> {
  const parseInitialUser = useCallback((str?: string | null) => {
    return JSON.parse(str || 'null') as TUser | null;
  }, []);

  const getProfileFn = useCallback(() => {
    return config.mode === 'fetch' ? config.useProfile : (_: HttpClient) => null;
  }, []);

  const useProfile = getProfileFn();
  const profile = useProfile({ httpClient: config.httpClient, httpConfig: config.httpConfig });
  const [user, setUser] = useState<TUser | null>(profile);

  useEffect(() => {
    if (config.mode === 'fetch') return;
    setUser(
      parseInitialUser(
        config.storage === 'cookie' ? cookies.get(config.key) : window[config.storage].getItem(config.key)
      )
    );
  }, []);

  return [user, setUser];
}

type UseConfigResult<TUser extends IUser = IUser> = {
  keys: {
    dataKey: string;
    authKey: string;
  };
  initialUserConfig: UserProviderMode<TUser>;
  httpClientConfig: HttpClient;
  extractUrl: (provider: Provider) => string;
};

type UseInitialUserResult<TUser extends IUser = IUser> = [
  TUser | null,
  React.Dispatch<React.SetStateAction<TUser | null>>
];
