import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import React from 'react';
import createUserProvider, { UserProviderFactory, UserProviderUrls } from './createUserProvider';

type User = {
  id: number;
  email: string;
};

jest.mock('axios');

describe('createUserProvider', () => {
  const providerOptions: UserProviderUrls & { dataKey: string } = {
    dataKey: 'user',
    loginUrl: 'your_api_goes_here',
    logoutUrl: 'your_api_goes_here',
    localOnly: true,
  };

  describe('fetch mode', () => {
    let factory: UserProviderFactory<User>;
    let Component: React.FC;
    const userData: User = { id: 1, email: 'test@test.com' };

    beforeEach(() => {
      const mockFetch: jest.Mock<User> = jest.fn();
      factory = createUserProvider<User>({
        ...providerOptions,
        mode: 'fetch',
        useProfile: mockFetch.mockImplementation(() => userData),
      });
    });

    it('returns a provider', async () => {
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
      expect(JSON.parse(node.textContent || '')).toMatchObject(userData);
    });

    it('updates the user', async () => {
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

      expect(JSON.parse(node.textContent || '')).toMatchObject(userData);
      fireEvent.click(loginBtn);
      expect(JSON.parse(node.textContent || '')).toMatchObject(updatedUser);
      fireEvent.click(logoutBtn);
      await waitFor(() => {
        expect(JSON.parse(node.textContent || '')).toEqual(null);
      });
      expect(axios.post).toHaveBeenCalledWith(providerOptions.logoutUrl, undefined, { withCredentials: true });
    });
  });
  describe('storage mode - cookie', () => {
    let factory: UserProviderFactory<User>;
    let Component: React.FC;

    beforeEach(() => {
      factory = createUserProvider<User>({
        ...providerOptions,
        mode: 'storage',
        storage: 'cookie',
        key: 'default',
      });
    });

    it('returns a provider', () => {
      Component = () => {
        const { user } = factory.useUser();
        return <div data-testid="user">{JSON.stringify(user)}</div>;
      };

      render(
        <factory.UserProvider>
          <Component></Component>
        </factory.UserProvider>
      );

      const node = screen.getByTestId('user');
      expect(node.textContent).toEqual('null');
    });

    it('updates the user', async () => {
      Component = () => {
        const { user, update, logout } = factory.useUser();
        return (
          <div>
            <div data-testid="user">{JSON.stringify(user)}</div>
            <button data-testid="login" onClick={() => update({ id: 1, email: 'dummy@test.com' })}>
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

      const node = screen.getByTestId('user');
      const loginBtn = screen.getByTestId('login');
      const logoutBtn = screen.getByTestId('logout');

      expect(node.textContent).toEqual('null');
      fireEvent.click(loginBtn);
      expect(JSON.parse(node.textContent || '')).toMatchObject({ id: 1, email: 'dummy@test.com' });
      fireEvent.click(logoutBtn);
      await waitFor(() => {
        expect(JSON.parse(node.textContent || '')).toEqual(null);
      });
      expect(axios.post).toHaveBeenCalledWith(providerOptions.logoutUrl, undefined, { withCredentials: true });
    });
  });
});
