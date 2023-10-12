import React, { useEffect, useState } from 'react';
import { DefaultUser, UserObject } from '../../utils';

export type AuthGuardConfig<T extends DefaultUser> = {
  useUser: () => UserObject<T>;
  useRedirect: () => string;
  useException?: () => boolean;
  acceptRoles?: string[];
};

function withAuthGuard<U extends DefaultUser, T extends object>(
  Component: React.ComponentType<T>,
  config: AuthGuardConfig<U>
): React.FC<T> {
  const useExceptionHook = config.useException ? config.useException : () => false;

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  return function AuthGuard(props) {
    const [status, setStatus] = useState<number | null>(null);
    const { user } = config.useUser();
    const redirectUrl = config.useRedirect();
    const hasException = useExceptionHook();

    // TODO: include 'acceptRoles' in condition
    useEffect(() => {
      if (!user) setStatus(401);
      else setStatus(200);
      return () => {
        setStatus(null);
      };
    }, [user]);

    useEffect(() => {
      if (!hasException && ![200, null].includes(status)) {
        window.location.pathname = redirectUrl;
      }
    }, [hasException, redirectUrl, status]);

    return <Component {...props} />;
  };
}

export default withAuthGuard;
