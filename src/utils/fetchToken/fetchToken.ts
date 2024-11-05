import axios, { AxiosRequestConfig, isAxiosError } from 'axios';
import cookies from '../cookies/cookies';

type FetchTokenProps = {
  authKey: string;
  dataKey: string;
  profileUrl: string;
  token: string;
  initialFunc: () => void;
  catchFunc: () => void;
  finallyFunc: () => void;
};

const fetchToken = async ({
  authKey,
  dataKey,
  profileUrl,
  token,
  initialFunc,
  catchFunc,
  finallyFunc,
}: FetchTokenProps) => {
  try {
    if (initialFunc) initialFunc();
    const conf = {
      headers: { Authorization: `Bearer ${token}`, TokenRefresh: 1 },
      withCredentials: true,
    } as AxiosRequestConfig<unknown>;
    const response = await axios.get(profileUrl, conf);
    if (response) {
      const newToken = response.headers[authKey.toLowerCase()]?.split(' ')?.pop();
      if (newToken) cookies.set(authKey, newToken, 365);
    }
  } catch (err: any) {
    if (isAxiosError(err)) {
      cookies.delete(authKey);
      cookies.delete(dataKey);
      if (catchFunc) catchFunc();
    }
  } finally {
    if (finallyFunc) finallyFunc();
  }
};

export default fetchToken;
