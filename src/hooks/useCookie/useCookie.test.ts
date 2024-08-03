import { renderHook, act } from '@testing-library/react-hooks';
import useCookie from './useCookie';

describe('useCookie', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      value: 'myCookie=John; expires=Thu, 01 Jan 2025 00:00:00 UTC; path=/',
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

  it('should set a new value', () => {
    const { result } = renderHook(() => useCookie<string>('myCookie'));
    act(() => {
      result.current.set('Doe');
    });
    expect(result.current.cookie).toEqual('Doe');
  });

  it('should delete cookie', () => {
    const { result } = renderHook(() => useCookie<string>('myCookie'));
    act(() => {
      result.current.unset();
    });
    expect(result.current.cookie).toEqual(null);
  });
});
