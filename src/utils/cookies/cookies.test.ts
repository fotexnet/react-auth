import cookies from './cookies';

describe('cookies.set', () => {
  it('should properly set a cookie', () => {
    cookies.set('name', 'John', 1);
    expect(document.cookie).toContain('name=John');
  });
});

describe('cookies.get', () => {
  it('should get value from a cookie', () => {
    document.cookie = 'name=John';
    const value = cookies.get('name');
    expect(value).toEqual('John');
  });
});
