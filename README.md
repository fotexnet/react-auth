# Table of content

- [Table of content](#table-of-content)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Package contents](#package-contents)
  - [Wrappers](#wrappers)
    - [withAuthGuard](#withauthguard)
  - [Hooks](#hooks)
    - [useCookie](#usecookie)
    - [useImage](#useimage)
  - [Utils](#utils)
    - [cookies `object`](#cookies-object)
    - [createCookieName](#createcookiename)
    - [login](#login)
    - [isLocalCredentials](#islocalcredentials)
    - [isSocialCredentials](#issocialcredentials)
    - [createAuthGuard](#createauthguard)
    - [createUserProvider](#createuserprovider)
- [Types](#types)
  - [LoginKeys](#loginkeys)
  - [HttpClient](#httpclient)
- [For developers](#for-developers)
  - [How to contribute](#how-to-contribute)
  - [How to release a new version](#how-to-release-a-new-version)

# Prerequisites

1. You must use Node 14 or higher
2. In your project, you must have react installed since react is a peer dependency (16 or higher)
3. Create a [Personal Access Token (classic)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-personal-access-token-classic)
4. Select `repo`, `workflow`, `write:packages` and `delete:packages` scopes
5. Setup a global `~/.npmrc` file with the following line where `TOKEN` equals to your PAT you just created: `//npm.pkg.github.com/:_authToken=TOKEN`

# Installation

1. In your project, setup a local `.npmrc` file with the following line: `@fotexnet:registry=https://npm.pkg.github.com`
2. Install the package using `yarn add @fotexnet/react-auth`

# Package contents

## Wrappers

### withAuthGuard

Provides protection for any component. Convenient way to use it is to wrap the target component when exporting it.
It requires an `AuthGuardConfig` object which requires a `url`.

```jsx
export default withAuthGuard(Component, { url: 'API_URL' });
```

```ts
type AuthGuardConfig = {
  url: string;
  exceptOr?: boolean[];
  exceptAnd?: boolean[];
  useError?: (status: number) => React.ComponentType | null;
  LoadingIndicatorComponent?: React.ComponentType;
} & Pick<LoginKeys, 'authKey'> &
  HttpClient;
```

**url `string`** <br />
_Required_

The endpoint which will be used for the request.

**LoadingIndicatorComponent `React.ComponentType`** <br />
_Optional_ <br />
_Default: Simple, internal loading component_

While the request is pending, this component will be shown.

**useException `() => boolean`** <br />
_Optional_ <br />
_Default: a hook that returns `false`_

If it is evaluated to `true`, then the guard will NOT run. Behaves as a standard hook.

**useError `(status: number) => JSX.Element | null`** <br />
_Optional_ <br />
_Default: a hook that returns `null`_

Error hook that will be called at the start. Behaves as a standard hook.

## Hooks

### useCookie

Provides an easy way to use the `cookies` object in a more React way. Operates on individual cookies.

```jsx
function Component() {
  const { cookie, set, unset } = useCookie('myCookie');

  useEffect(() => {
    set('myValue');
  }, []);

  return (
    <div>
      <div>{cookie}</div>
      <button onClick={() => set('JohnDoe')}>Update cookie</button>
      <button onClick={() => unset()}>Remove cookie</button>
    </div>
  );
}
```

### useImage

Provides an easy way to convert an image file into `base64` string. Returns the data url. The API allows you to pass a configuration object where you can modify the request.

```jsx
function Component() {
  const imageUrl = useImage('path_to_image');
  return <img src={imageUrl} />;
}
```

## Utils

### cookies `object`

**get `(cname: string) => string`** <br />
_cname: cookie name in camelCase (works best)_ <br />
_Returns: parsed cookie value if exists_

Searches the `document.cookie` string for the given `cname` and returns it's value if found, empty string otherwise.

**set `(cname: string, cvalue: any, exdays: number) => void`** <br />
_cname: cookie name in camelCase (works best)_ <br />
_cvalue: anything you want to assign as value_ <br />
_exdays: expiration date in days_

Sets a new key-value pair in the `document.cookie` string.

**delete `(cname: string) => void`** <br />
_cname: cookie name in camelCase (works best)_

Deletes cookie from `document.cookie` string by resetting it's expiration day to `Thu, 01 Jan 1970 00:00:00 UTC`. This works even if the cookie did NOT exist before.

### createCookieName

_Signature: (str: string) => string_

Transforms given string into `lower_snake_case`. Works as if the input is in `camelCase`.

```js
const myCookie = createCookieName('myCookie'); // my_cookie
const abc = createCookieName('ABC'); // a_b_c
```

### login

Provides an easy way to get an access token for the `fotexnet` infrastructure.
Define the login endpoint via `apiUrl`, the `dataKey` which will be used to identify the user object
and a `provider` method as well as the associated `credentials` info.

```ts
type LoginConfig = {
  apiUrl: string;
  provider: Provider;
  credentials: Credentials;
} & LoginKeys &
  HttpClient;
```

**apiUrl `string`** <br />
_Required_

Endpoint which will be used for the request.

**provider `Provider`** <br />
_Required_

Name of the provider. Possible values are `'local' | 'google' | 'facebook'`.

**credentials `Credentials`** <br />
_Required_

It's an `object` which depends on the `provider` field. If it's set to `'local'`, this `object` will require an `email` and `password` field. If it's set to any social provider available, it will require a `social_token` which comes from the social login response.

### isLocalCredentials

This is a type guard function for the `Credentials` type to check wheter or not it implements the `LocalCredentials` type.

```javascript
const isLocal = isLocalCredentials({ email: '', password: '' }); // true
const isLocal = isLocalCredentials({ id: 0, name: '', email: '', password: '' }); // true
const isLocal = isLocalCredentials({ email: '' }); // false
const isLocal = isLocalCredentials({ name: '' }); // false
```

### isSocialCredentials

This is a type guard function for the `Credentials` type to check wheter or not it implements the `SocialCredentials` type.

```javascript
const isSocial = isSocialCredentials({ social_token: '' }); // true
const isSocial = isSocialCredentials({ id: 0, name: '', social_token: '' }); // true
const isSocial = isSocialCredentials({}); // false
const isSocial = isSocialCredentials({ name: '' }); // false
```

### createAuthGuard

Returns a higher-order component that calls the `[withAuthGuard](#withauthguard)` higher-order component with the provided config object and component. It is used to create global `[withAuthGuard](#withauthguard)` higher-order components.

### createUserProvider

Provides an easy way to share user data throughout the application. Returns a `UserProvider` wrapper, which you can use to wrap your app, and a `useUser` hook to track user data.
The `useUser` hook has 2 methods (`set` and `unset`), that are used to refresh the UI, as well as the `user` object.

```ts
interface IUser extends Record<string, unknown> {
  id: number;
  email: string;
}

type UserProviderConfig<TUser extends IUser = IUser> = {
  loginUrl: string | { local: string; social: string };
  logoutUrl: string;
  localOnly: boolean;
  mode: 'storage' | 'fetch';
  key?: string;
  storage?: 'localStorage' | 'sessionStorage' | 'cookie';
  useProfile?: (http: HttpClient) => TUser | null;
} & LoginKeys &
  HttpClient;
```

**loginUrl `string | { local: string; social: string; }`** <br />
_Required_

Endpoint(s) which will be used for the request. If `localOnly` is set to `false`, it will require an `object` with a `local` and `social` field. Both takes a `string` which will be used as url for the request. If `localOnly` is set to `true`, it will require only one `string` which will be used as url for the request.

**logoutUrl `string`** <br />
_Required_

Endpoint which will be used for the request.

**localOnly `boolean`** <br />
_Optional_
_Default: `false`_

Determines if the provider has social login or not.

**mode `'storage' | 'fetch'`** <br />
_Required_

Determines the mode of the provider. `'storage'` means using one of the browser's storage object, `'fetch'` means using a hook to fetch user data continuously.

**key `string`** <br />
_Required (available when `mode: 'storage'`)_ <br />
_Default: Simple, internal loading component_

Name of the key in the chosen storage.

**storage `'localStorage' | 'sessionStorage' | 'cookie'`** <br />
_Optional (available when `mode: 'storage'`)_ <br />
_Default: `'cookie'`_

Used for setting and reading user data from.

**useProfile `(http: HttpClient) => TUser | null`** <br />
_Required (available when `mode: 'fetch'`)_ <br />

Used for fetching user data.

```jsx
// does not matter where you create it
const { UserProvider, useUser } = createUserProvider({
  dataKey: 'user',
  authKey: 'AuthToken',
  loginUrl: 'your_api_endpoint',
  logoutUrl: 'your_api_endpoint',
  localOnly: true,
  mode: 'storage',
  storage: 'cookie',
  key: 'default',
});

// App.js
function App() {
  return (
    <UserProvider>
      <Component />
    </UserProvider>
  );
}

// Component.js
function Component() {
  const { user, update, logout } = useUser();
  return (
    <div>
      <div>{JSON.stringify(user || '')}</div>
      <button onClick={() => update({ id: 1, email: 'dummy@test.com' })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

In the example above the `update` method requires an object which will be set as the `user`. It's supposed to be used for updating the `user` object if neccessary.

```jsx
const config = {
  provider: 'local',
  credentials: { email: 'dummy@test.com', password: 'supersecretpassword' },
};

login(config).then(user => console.log(user));

// or

const user = await login(config);
console.log(user);
```

In the example above the `login` method requires an object which will be used for the `login` utility function.

# Types

## LoginKeys

```ts
type LoginKeys = {
  dataKey: string;
  authKey?: string;
};
```

**dataKey `string`** <br />
_Required_

Name of the field that comes back in the response's `data` object.

```json
// { dataKey: 'user' }
{
  "http_status_code": 200,
  "status": true,
  "message": "USERS_LOGIN",
  "data": {
    "user": {
      "id": 36,
      "name": "Gipsz Jakab",
      "email": "gipsz.jakab@test.com",
      "is_admin": true,
      "enabled": true,
      "lastlogin_at": "2019-03-26 09:20:42"
    }
  },
  "errors": []
}
```

**authKey `string`** <br />
_Optional_ <br />
_Default: `authorization`_

This is the name of the header that should be send along with the request. Only works if it's set in the cookies.

## HttpClient

```ts
type HttpClient = {
  httpClient?: AxiosInstance;
  httpConfig?: Omit<AxiosRequestConfig, 'withCredentials'>;
};
```

**httpClient `AxiosInstance`** <br />
_Optional_ <br />
_Default: `axios`_

Custom http client to be used instead of `axios.default`.

**httpConfig `AxiosRequestConfig`** <br />
_Optional_ <br />
_Default: `undefined`_

Additional config for the http client. Can be used for the default client.

# For developers

## How to contribute

1. Create an issue about the changes you'd like to see (use the pre-made templates for features and bugs)
2. Clone the repository on your local machine (`git pull` if you already cloned it)
3. Create a new branch locally (`feature/branch-name` or `bugfix/branch-name`) from `main`
4. Make changes
5. Commit your changes using `git commit`, then choose the appropriate field (this is important for ci)
6. Follow the CLI instructions
7. Push and create a PR
8. Wait for tests to pass
9. Merge into main

## How to release a new version

1. Go to `GitHub Actions`
2. Choose `Release` action on the left
3. Click on `Run workflow` that's located in the top right of the previous actions table

_**Note:** For this to work, it's very important to follow the [How to contribute](#how-to-contribute) section._
