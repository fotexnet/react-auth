import { act, renderHook } from '@testing-library/react';
import useCookie from './useCookie';

describe('useCookie', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      value: 'my_cookie=John; expires=Thu, 01 Jan 2023 00:00:00 UTC; path=/',
      writable: true,
    });
  });

  afterEach(() => {
    document.cookie = '';
  });

  it('should return value', () => {
    const { result } = renderHook(() => useCookie<string>('myCookie'));
    expect(result.current.cookie).toEqual('John');
  });

  it('should set a new value', async () => {
    const { result } = renderHook(() => useCookie<string>('myCookie'));
    act(() => {
      result.current.set('Doe');
    });
    expect(result.current.cookie).toEqual('Doe');
  });

  it('should delete cookie', async () => {
    const { result } = renderHook(() => useCookie<string>('myCookie'));
    act(() => {
      result.current.unset();
    });
    expect(result.current.cookie).toEqual(null);
  });
});
