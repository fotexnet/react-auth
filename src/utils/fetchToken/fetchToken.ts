import axios, { AxiosRequestConfig, AxiosResponse, isAxiosError } from 'axios';
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

const setNewToken = (authKey: string, response: AxiosResponse): void => {
  const newToken = response.headers[authKey.toLowerCase()]?.split(' ')?.pop();
  if (newToken) cookies.set(authKey, newToken, 365);
};

const handleError = (authKey: string, dataKey: string, catchFunc: () => void): void => {
  cookies.delete(authKey);
  cookies.delete(dataKey);
  if (catchFunc) catchFunc();
};

const fetchToken = async ({
  authKey,
  dataKey,
  profileUrl,
  token,
  initialFunc,
  catchFunc,
  finallyFunc,
}: FetchTokenProps): Promise<void> => {
  try {
    initialFunc?.();

    const conf = {
      headers: { Authorization: `Bearer ${token}`, TokenRefresh: 1 },
      withCredentials: true,
    } as AxiosRequestConfig<unknown>;

    const response = await axios.get(profileUrl, conf);

    if (response) setNewToken(authKey, response);
  } catch (err) {
    if (isAxiosError(err)) handleError(authKey, dataKey, catchFunc);
  } finally {
    finallyFunc?.();
  }
};

export default fetchToken;
