import axios from 'axios';
import login, { Credentials, LoginConfig, Provider, isLocalCredentials, isSocialCredentials } from './login';

describe('login', () => {
  const customer = { id: 1, first_name: 'Viktor', last_name: 'Nagy', email: 'nagy.viktor@fotex.net' };
  let postSpy: jest.SpyInstance;

  beforeEach(() => {
    postSpy = jest.spyOn(axios, 'post').mockImplementation(async () => {
      return { headers: { authorization: 'Bearer JWT_TOKEN' }, data: { data: { customer } } };
    });
  });

  afterEach(() => {
    postSpy.mockRestore();
  });

  it('should return user object via local authentication', async () => {
    // Test case constants
    const BASE_URL: string = 'https://sugarmozi-backend.dev.fotex.net/api/public/auth';
    const PAYLOAD: Credentials = { email: 'nagy.viktor@fotex.net', password: 'Viktor10' };

    // Create the local login function
    const config: LoginConfig = { apiUrl: BASE_URL, provider: 'local', credentials: PAYLOAD, dataKey: 'customer' };
    const user = await login<typeof customer>(config);

    // Expected results
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(config.apiUrl, config.credentials, {
      ...config.httpConfig,
      withCredentials: true,
    });
    expect(user?.id).toEqual(1);
    expect(user?.token).toEqual('JWT_TOKEN');
  });

  it('should return user object via social authentication', async () => {
    // Test case constants
    const BASE_URL: string = 'https://sugarmozi-backend.dev.fotex.net/api/public/auth/social';
    const PROVIDER: Provider = 'google';
    const PAYLOAD: Credentials = { social_token: 'GOOGLE_JWT_TOKEN' };

    // Create the local login function
    const config: LoginConfig = { apiUrl: BASE_URL, provider: PROVIDER, credentials: PAYLOAD, dataKey: 'customer' };
    const user = await login<typeof customer>(config);

    // Expected results
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(
      config.apiUrl,
      { ...config.credentials, social_provider: PROVIDER },
      { ...config.httpConfig, withCredentials: true }
    );
    expect(user?.id).toEqual(1);
    expect(user?.token).toEqual('JWT_TOKEN');
  });
});

describe('isLocalCredential type guard', () => {
  it('should return true for exact match', () => {
    const isLocal = isLocalCredentials({ email: '', password: '' });
    expect(isLocal).toBeTruthy();
  });

  it('should return true for subset match', () => {
    const isLocal = isLocalCredentials({ id: 0, name: '', email: '', password: '' } as unknown as Credentials);
    expect(isLocal).toBeTruthy();
  });

  it('should return false for missing arguments', () => {
    const isLocal = isLocalCredentials({ email: '' } as unknown as Credentials);
    expect(isLocal).toBeFalsy();
  });

  it('should return false for different arguments', () => {
    const isLocal = isLocalCredentials({ name: '' } as unknown as Credentials);
    expect(isLocal).toBeFalsy();
  });
});

describe('isSocialCredentials type guard', () => {
  it('should return true for exact match', () => {
    const isSocial = isSocialCredentials({ social_token: '' });
    expect(isSocial).toBeTruthy();
  });

  it('should return true for subset match', () => {
    const isSocial = isSocialCredentials({ id: 0, name: '', social_token: '' } as unknown as Credentials);
    expect(isSocial).toBeTruthy();
  });

  it('should return false for missing arguments', () => {
    const isSocial = isSocialCredentials({} as unknown as Credentials);
    expect(isSocial).toBeFalsy();
  });

  it('should return false for different arguments', () => {
    const isSocial = isSocialCredentials({ name: '' } as unknown as Credentials);
    expect(isSocial).toBeFalsy();
  });
});
