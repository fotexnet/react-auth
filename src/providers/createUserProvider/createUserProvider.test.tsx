import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import client from '../../utils/createHttpClient/createHttpClient';
import createUserProvider from './createUserProvider';
import { UserProviderConfig, UserProviderFactory } from './types';

type User = {
  id: number;
  email: string;
};

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    post: jest.fn(),
  })),
  post: jest.fn(),
}));

describe('createUserProvider', () => {
  let postSpy: jest.SpyInstance;
  let factory: UserProviderFactory<User>;
  let Component: React.FC;
  const providerOptions: UserProviderConfig = {
    dataKey: 'user',
    loginUrl: 'your_api_goes_here',
    logoutUrl: 'your_api_goes_here',
    localOnly: true,
    profileUrl: 'your_api_url',
  };

  beforeEach(() => {
    postSpy = jest.spyOn(client, 'post');
    factory = createUserProvider<User>({
      ...providerOptions,
    });
  });

  afterEach(() => {
    postSpy.mockRestore();
  });

  it('should return a provider', async () => {
    Component = () => {
      const { user } = factory.useUser();
      return <div data-testid="user">{JSON.stringify(user)}</div>;
    };

    render(
      <factory.UserProvider>
        <Component></Component>
      </factory.UserProvider>
    );

    const node = await screen.findByTestId('user');
    expect(JSON.parse(node.textContent || 'null')).toEqual(null);
  });

  it('should update the user', async () => {
    const updatedUser = { id: 1, email: 'dummy@test.com' };
    Component = () => {
      const { user, update, logout } = factory.useUser();
      return (
        <div>
          <div data-testid="user">{JSON.stringify(user)}</div>
          <button data-testid="login" onClick={() => update(updatedUser)}>
            Login
          </button>
          <button data-testid="logout" onClick={() => logout()}>
            Logout
          </button>
        </div>
      );
    };

    render(
      <factory.UserProvider>
        <Component></Component>
      </factory.UserProvider>
    );

    const node = await screen.findByTestId('user');
    const loginBtn = await screen.findByTestId('login');
    const logoutBtn = await screen.findByTestId('logout');

    expect(JSON.parse(node.textContent || 'null')).toEqual(null);
    fireEvent.click(loginBtn);
    expect(JSON.parse(node.textContent || '{}')).toMatchObject(updatedUser);
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(JSON.parse(node.textContent || 'null')).toEqual(null);
    });

    expect(postSpy).toHaveBeenCalledWith(providerOptions.logoutUrl, undefined, { withCredentials: true });
  });
});
