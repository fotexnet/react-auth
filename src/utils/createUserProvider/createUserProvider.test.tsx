import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import createUserProvider, { UserProviderFactory } from './createUserProvider';

interface IUser {
  id: number;
  email: string;
}

describe('createUserProvider', () => {
  let factory: UserProviderFactory<IUser>;
  let Component: React.FC;

  beforeEach(() => {
    factory = createUserProvider<IUser>();
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
      const { user, login, logout } = factory.useUser();
      return (
        <div>
          <div data-testid="user">{JSON.stringify(user)}</div>
          <button data-testid="login" onClick={() => login({ id: 1, email: 'dummy@test.com' })}>
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
    expect(node.textContent).toEqual('null');
  });
});
