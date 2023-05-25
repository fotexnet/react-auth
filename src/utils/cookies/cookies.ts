export function createCookieName(str: string): string {
  const delimiter = '_';
  const trimmedStr = str.trim();
  let name: string = '';

  for (let i: number = 0; i < trimmedStr.length; i++) {
    if (i === 0) {
      name += trimmedStr[i].toLowerCase();
      continue;
    }

    const isUpper = /[A-Z]/.test(trimmedStr[i]);
    const isBlank = trimmedStr[i] === ' ';

    if (isUpper && name.at(-1) !== delimiter) {
      name += delimiter + trimmedStr[i].toLowerCase();
      continue;
    }

    if (isBlank) {
      if (trimmedStr[i + 1] === ' ') continue;

      name += delimiter;
      continue;
    }

    name += trimmedStr[i].toLowerCase();
  }

  return name;
}

function setCookie(cname: string, cvalue: string, exdays: number): void {
  const date = new Date();
  const name = createCookieName(cname);
  date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + date.toISOString();
  document.cookie = name + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname: string): string {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookie = decodedCookie.split(';');
  for (let i = 0; i < cookie.length; i++) {
    let c = cookie[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

const cookies = { get: getCookie, set: setCookie };

export default cookies;
