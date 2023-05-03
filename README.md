# Table of content

- [Table of content](#table-of-content)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Package contents](#package-contents)
  - [Utils](#utils)
    - [login](#login)

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