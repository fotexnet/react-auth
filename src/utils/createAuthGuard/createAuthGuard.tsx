import React from 'react';
import withAuthGuard, { AuthGuardConfig } from '../../hoc/withAuthGuard/withAuthGuard';
import { DefaultUser } from '../createUserProvider/types';

function createAuthGuard<U extends DefaultUser, T extends object>(config: AuthGuardConfig<U>) {
  return (Component: React.ComponentType<T>): React.FC<T> => {
    return withAuthGuard(Component, config);
  };
}

export default createAuthGuard;
