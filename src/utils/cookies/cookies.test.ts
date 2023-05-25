import cookies from './cookies';

class MockDocument {
  private _cookie: string = '';

  set cookie(value) {
    this._cookie = value;
  }

  get cookie() {
    return this._cookie;
  }
}

beforeEach(() => {
  const mockDocument = new MockDocument();
  Object.defineProperty(global, 'document', {
    value: mockDocument,
    writable: true,
  });
});

afterEach(() => {
  document.cookie = '';
});

describe('cookies.set', () => {
  it('should properly set a cookie', () => {
    cookies.set('name', 'John', 1);
    expect(document.cookie).toContain('name=John');
    expect(document.cookie).toContain('expires=');
    expect(document.cookie).toContain('path=/');
  });
});

describe('cookies.get', () => {
  it('should get value from a cookie', () => {
    document.cookie = 'name=John';
    const value = cookies.get('name');
    expect(value).toEqual('John');
  });
});
