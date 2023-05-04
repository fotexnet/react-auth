# Table of content

- [Table of content](#table-of-content)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Package contents](#package-contents)
  - [Wrappers](#wrappers)
    - [withAuthGuard](#withauthguard)
  - [Utils](#utils)
    - [login](#login)
    - [isLocalCredentials](#islocalcredentials)
    - [isSocialCredentials](#issocialcredentials)
    - [createUserProvider](#createuserprovider)

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

```jsx
export default withAuthGuard(Component, { url: 'YOUR_API', createAuthHeader: () => ['header_name', 'token_value'] });
```

It requires an `AuthGuardConfig` object which requires an `url` and a `createAuthHeader` function.

| parameter                   | type                     | required | default           | description                                                                                                                       |
| --------------------------- | ------------------------ | -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `url`                       | `string`                 | Yes      | -                 | An http `GET` request will be sent to this `url` with the required authorization headers to check that the user's token is active |
| `createAuthHeader`          | `() => [string, string]` | Yes      | -                 | Returns a tuple where the first element is the name of the header and the second element is the token                             |
| `LoadingIndicatorComponent` | `React.ComponentType`    | No       | `FallbackLoading` | While the request is pending, this component will be shown                                                                        |
| `UnauthorizedComponent`     | `React.ComponentType`    | No       | `Fallback401`     | If the token check returns `401`, this component will be shown                                                                    |
| `InternalErrorComponent`    | `React.ComponentType`    | No       | `Fallback500`     | If the token check fails for some other reason and the server returns `500`, this component will be shown                         |

**Defaults**

```jsx
// LoadingIndicatorComponent
const FallbackLoading = () => <div data-testid="loading">Loading...</div>;
```

```jsx
// UnauthorizedComponent
const Fallback401 = () => <div data-testid="auth-error-401">401</div>;
```

```jsx
// InternalErrorComponent
const Fallback500 = () => <div data-testid="auth-error-500">500</div>;
```

## Utils

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

### createUserProvider

Provides an easy way to share user data throughout the application. Returns a `UserProvider` wrapper, which you can use to wrap your app, and a `useUser` hook to track user data.
The `useUser` hook has 2 methods (`set` and `unset`), that are used to refresh the UI, as well as the `user` object.

```jsx
// does not matter where you create it
const { UserProvider, useUser } = createUserProvider();

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
  const { user, set, unset } = useUser();
  return (
    <div>
      <div>{JSON.stringify(user || '')}</div>
      <button onClick={() => set({ id: 1, email: 'dummy@test.com' })}>Login</button>
      <button onClick={() => unset()}>Logout</button>
    </div>
  );
}
```

In the example above the `set` method requires an object which will be set as the `user`. You can use the [`login`](#login) functionality in conjuction with this
to transfer and update the `user` object.

```jsx
const config = {
  apiUrl: 'YOUR_API_URL',
  provider: 'local',
  credentials: { email: 'dummy@test.com', password: 'supersecretpassword' },
  dataKey: 'customer',
};

login(config).then(user => set(user));

// or

login(config).then(set);
```

```

```
