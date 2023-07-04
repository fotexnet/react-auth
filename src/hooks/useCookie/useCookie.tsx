import { useCallback, useEffect, useState } from 'react';
import { cookies } from '../../utils';
import { parseCookie } from '../../utils/cookies/cookies';

function useCookie<T = unknown>(cname: string): UseCookie<T> {
  const [cookie, setCookie] = useState<T | null>(null);

  const set = useCallback(
    (value: string, exdays: number = 1) => {
      cookies.set(cname, value, exdays);
      const parsedCookie = parseCookie<T>(value);
      setCookie(parsedCookie);
    },
    [cname]
  );

  const unset = useCallback(() => {
    cookies.delete(cname);
    setCookie(null);
  }, [cname]);

  useEffect(() => {
    const value = cookies.get(cname);
    const parsedCookie = parseCookie<T>(value);
    setCookie(parsedCookie);
  }, []);

  return { cookie, set, unset };
}

export default useCookie;

export type UseCookie<T> = {
  cookie: T | null;
  set: (value: string, exdays?: number) => void;
  unset: () => void;
};
