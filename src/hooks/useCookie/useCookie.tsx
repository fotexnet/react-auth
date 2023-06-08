import { useCallback, useEffect, useState } from 'react';
import { cookies } from '../../utils';

function useCookie<T = unknown>(cname: string): UseCookie<T> {
  const [cookie, setCookie] = useState<T | null>(null);

  const parseCookie = useCallback((value: string): T | null => {
    const isBoolean = value === 'true' || value === 'false';
    const isNumber = !!value && !isNaN(+value);
    const isObject = (value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'));
    return isBoolean || isNumber || isObject ? JSON.parse(value) : !!value ? value : null;
  }, []);

  const set = useCallback(
    (value: string, exdays: number = 1) => {
      cookies.set(cname, value, exdays);
      const parsedCookie = parseCookie(value);
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
    const parsedCookie = parseCookie(value);
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
