import React from 'react';
import withAuthGuard, { AuthGuardConfig } from '../../hoc/withAuthGuard/withAuthGuard';

function createAuthGuard<T extends object>(config: AuthGuardConfig) {
  return (Component: React.ComponentType<T>): React.FC<T> => {
    return withAuthGuard(Component, config);
  };
}

export default createAuthGuard;
