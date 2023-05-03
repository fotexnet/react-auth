import axios from 'axios';
import login, { Credentials, LoginConfig, Provider } from './login';

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
    expect(postSpy).toHaveBeenCalledWith(config.apiUrl, config.credentials, config.httpConfig);
    expect(user?.id).toEqual(1);
    expect(user?.token).toEqual('JWT_TOKEN');
  });

  it('should return user object via social authentication', async () => {
    // Test case constants
    const BASE_URL: string = 'https://sugarmozi-backend.dev.fotex.net/api/public/auth/social';
    const PROVIDER: Provider = 'google';
    const PAYLOAD: Credentials = { social_token: 'GOOGLE_JWT_TOKEN', social_provider: PROVIDER };

    // Create the local login function
    const config: LoginConfig = { apiUrl: BASE_URL, provider: PROVIDER, credentials: PAYLOAD, dataKey: 'customer' };
    const user = await login<typeof customer>(config);

    // Expected results
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(config.apiUrl, config.credentials, config.httpConfig);
    expect(user?.id).toEqual(1);
    expect(user?.token).toEqual('JWT_TOKEN');
  });
});
