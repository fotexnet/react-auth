import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import React from 'react';
import withAuthGuard, { AuthGuardConfig } from './withAuthGuard';

describe('withAuthGuard', () => {
  let getSpy: jest.SpyInstance;
  let WrappedComponent: React.FC;
  const Component = () => <div data-testid="protected">Protected content</div>;
  const config: AuthGuardConfig = { url: 'my_api', createAuthHeader: () => ['authorization', 'jwt_token'] };

  beforeEach(() => {
    getSpy = jest.spyOn(axios, 'get');
  });

  afterEach(() => {
    getSpy.mockRestore();
  });

  it('should render the original component', async () => {
    getSpy.mockImplementation(async () => ({ status: 200 }));
    WrappedComponent = withAuthGuard(Component, config);

    render(<WrappedComponent />);

    const node = await screen.findByTestId('protected');
    expect(node).toBeInTheDocument();
  });

  it('should render the unauthorized component', async () => {
    getSpy.mockImplementation(async () => ({ status: 401 }));
    WrappedComponent = withAuthGuard(Component, config);

    render(<WrappedComponent />);

    const node = await screen.findByTestId('protected');
    expect(node).not.toBeInTheDocument();
    const unauthorized = await screen.findByTestId('auth-error-401');
    expect(unauthorized).toBeInTheDocument();
  });

  it('should render the error component', async () => {
    getSpy.mockImplementation(async () => ({ status: 500 }));
    WrappedComponent = withAuthGuard(Component, config);

    render(<WrappedComponent />);

    const node = await screen.findByTestId('protected');
    expect(node).not.toBeInTheDocument();
    const error = await screen.findByTestId('auth-error-500');
    expect(error).toBeInTheDocument();
  });
});
