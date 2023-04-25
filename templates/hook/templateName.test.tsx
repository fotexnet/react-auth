import { renderHook } from '@testing-library/react';
import useTemplateName from './TemplateName.hook';

describe('TemplateName hook', () => {
  it('should mount', () => {
    const { result } = renderHook(() => useTemplateName());
    expect(result.current).toBe('Hello World!');
  });
});
