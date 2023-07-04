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
  authKey?: string;
  httpClient?: AxiosInstance;
  httpConfig?: AxiosRequestConfig;
  LoadingIndicatorComponent?: React.ComponentType;
  UnauthorizedComponent?: React.ComponentType;
  InternalErrorComponent?: React.ComponentType;
};
```

**url `string`**
_Required_

The endpoint which will be used for the request.

**authKey `string`**
_Optional_
_Default: `authorization`_

This is the name of the header that should be send along with the request. Only works if it's set in the cookies.

**httpClient `AxiosInstance`**
_Optional_
_Default: `axios`_

Custom http client to be used instead of `axios.default`.

**httpConfig `AxiosRequestConfig`**
_Optional_
_Default: `undefined`_

Additional config for the http client. Can be used for the default client.

**LoadingIndicatorComponent `React.ComponentType`**
_Optional_
_Default: Simple, internal loading component_

While the request is pending, this component will be shown.

**UnauthorizedComponent `React.ComponentType`**
_Optional_
_Default: Simple, internal loading component_

If the token check returns `401`, this component will be shown.

**InternalErrorComponent `React.ComponentType`**
_Optional_
_Default: Simple, internal loading component_

If the token check fails for some other reason and the server returns `500`, this component will be shown.

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

**get `(cname: string) => string`**
_cname: cookie name in camelCase (works best)_
_Returns: parsed cookie value if exists_

Searches the `document.cookie` string for the given `cname` and returns it's value if found, empty string otherwise.

**set `(cname: string, cvalue: any, exdays: number) => void`**
_cname: cookie name in camelCase (works best)_
_cvalue: anything you want to assign as value_
_exdays: expiration date in days_

Sets a new key-value pair in the `document.cookie` string.

**delete `(cname: string) => void`**
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

**Configuration object**

| parameter     | type                 | required | default | description                                                         |
| ------------- | -------------------- | -------- | ------- | ------------------------------------------------------------------- |
| `dataKey`     | `string`             | Yes      | -       | This key will be used to acces the user object on the response body |
| `apiUrl`      | `string`             | Yes      | -       | Full url of the login endpoint                                      |
| `provider`    | `Provider`           | Yes      | -       | Authentication provider                                             |
| `credentials` | `Credentials`        | Yes      | -       | Authentication info                                                 |
| `httpClient`  | `AxiosInstance`      | No       | `axios` | -                                                                   |
| `httpConfig`  | `AxiosRequestConfig` | No       | -       | -                                                                   |

**Supported providers:** `'local' | 'google' | 'facebook'`

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

**Configuration object:**

| parameter    | type                                                 | required | default           | description                                                                                                                                 |
| ------------ | ---------------------------------------------------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`       | `'storage'` or `'fetch'`                             | Yes      | -                 | This value determines where to load user data from when the page is loaded. `'storage'` means browser storage, `'fetch'` means http request |
| `storage`    | `'localStorage'` or `'sessionStorage'` or `'cookie'` | No       | `'cookie'`        | Only available when `mode` is set to `storage`. Used to set initial user data                                                               |
| `key`        | `string`                                             | Yes      | -                 | Only available when `mode` is set to `storage`. Storage key                                                                                 |
| `useProfile` | `(http: HttpClient) => TUser, null`                  | Yes      | -                 | Only available when `mode` is set to `fetch`. Used to set initial user data                                                                 |
| `dataKey`    | `string`                                             | Yes      | -                 | This key will be used to acces the user object on the response body                                                                         |
| `authKey`    | `string`                                             | No       | `'authorization'` | This key will be used to acces the access token in the request/response headers                                                             |
| `loginUrl`   | `string | { local: tring, social: string }`          | Yes      | -                 | This `string` will be used for the `login` function                                                                                         |
| `logoutUrl`  | `string`                                             | Yes      | -                 | This `string` will be used for the `logout` function                                                                                        |
| `localOnly`  | `boolean`                                            | No       | `false`           | This `boolean` will be used to determine the type of `loginUrl`                                                                             |
| `httpClient` | `AxiosInstance`                                      | No       | `axios`           | -                                                                                                                                           |
| `httpConfig` | `AxiosRequestConfig`                                 | No       | -                 | -                                                                                                                                           |

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
