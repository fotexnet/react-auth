import axios from 'axios';
import local from './local';

describe('local', () => {
  it('should return a user', async () => {
    // Test case constants
    const BASE_URL: string = 'https://sugarmozi-backend.dev.fotex.net/api/public/auth';
    const PAYLOAD = { email: 'nagy.viktor@fotex.net', password: 'Viktor10' };
    const customer = { id: 1, first_name: 'Viktor', last_name: 'Nagy', email: 'nagy.viktor@fotex.net' };

    // Spying on POST requests
    const postSpy = jest.spyOn(axios, 'post').mockImplementation(async () => {
      return { headers: { authorization: 'Bearer JWT_TOKEN' }, data: { data: { customer } } };
    });

    // Create the local login function
    const user = await local<typeof customer>(BASE_URL, PAYLOAD, { key: 'customer' });

    // Expected results
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(BASE_URL, PAYLOAD, { withCredentials: true });
    expect(user?.id).toEqual(1);
    expect(user?.token).toEqual('JWT_TOKEN');

    // Cleanup spy functions
    postSpy.mockRestore();
  });
});
