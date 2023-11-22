import { DatabaseRecord, HttpClient, Prettify } from '../../interfaces/Record';
import { LoginProvider, LoginKeys } from '../../utils/login/login';

export type DefaultUser = { email: string } & DatabaseRecord;

export type UserObject<TUser extends DefaultUser = DefaultUser> = {
  user: TUser | null | undefined;
  loading: boolean;
  update: (user: Partial<TUser>) => void;
  login: (config: LoginProvider & HttpClient) => Promise<TUser>;
  logout: (config?: HttpClient) => Promise<void>;
};

export type UserProviderConfig = Prettify<
  { profileUpdateInterval?: number } & UserProviderUrls & LoginKeys & HttpClient
>;

export type UserProviderUrls = { profileUrl: string; logoutUrl: string } & (
  | { loginUrl: string; localOnly: true }
  | { loginUrl: { local: string; social: string }; localOnly: false }
);

export type UserProviderFactory<TUser extends DefaultUser = DefaultUser> = {
  UserProvider: React.FC<React.PropsWithChildren<unknown>>;
  useUser: () => UserObject<TUser>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAuthGuard: (Component: React.ComponentType<any>, config: AuthGuardConfig) => React.FC<any>;
};

export type AuthGuardConfig = {
  useRedirect: () => () => void;
  useException?: () => boolean;
  acceptRoles?: string[];
};
