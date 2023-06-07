import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import createUserProvider, { UserProviderFactory } from './createUserProvider';

interface IUser {
  id: number;
  email: string;
}

describe('createUserProvider', () => {
  describe('fetch mode', () => {
    let factory: UserProviderFactory<IUser>;
    let Component: React.FC;
    const userData: IUser = { id: 1, email: 'test@test.com' };

    beforeEach(() => {
      const mockFetch: jest.Mock<Promise<IUser>> = jest.fn();
      factory = createUserProvider<IUser>({
        mode: 'fetch',
        useFetch: mockFetch.mockImplementation(() => Promise.resolve(userData)),
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
        const { user, set, unset } = factory.useUser();
        return (
          <div>
            <div data-testid="user">{JSON.stringify(user)}</div>
            <button data-testid="login" onClick={() => set(updatedUser)}>
              Login
            </button>
            <button data-testid="logout" onClick={() => unset()}>
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
      expect(JSON.parse(node.textContent || '')).toEqual(null);
    });
  });
  describe('storage mode - cookie', () => {
    let factory: UserProviderFactory<IUser>;
    let Component: React.FC;

    beforeEach(() => {
      factory = createUserProvider<IUser>({
        mode: 'storage',
        storage: document.cookie,
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

    it('updates the user', () => {
      Component = () => {
        const { user, set, unset } = factory.useUser();
        return (
          <div>
            <div data-testid="user">{JSON.stringify(user)}</div>
            <button data-testid="login" onClick={() => set({ id: 1, email: 'dummy@test.com' })}>
              Login
            </button>
            <button data-testid="logout" onClick={() => unset()}>
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
      expect(node.textContent).toEqual('null');
    });
  });
});
