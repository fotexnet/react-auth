'use server';

export function parseCookie<T>(value: string): T | null {
  const isBoolean = value === 'true' || value === 'false';
  const isNumber = !!value && !isNaN(+value);
  const isObject = (value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'));
  return isBoolean || isNumber || isObject ? JSON.parse(value) : !!value ? value : null;
}

export function createCookieName(str: string): string {
  const delimiter = '_';
  const trimmedStr = str.trim();
  let name: string = '';

  for (let i: number = 0; i < trimmedStr.length; i++) {
    if (i === 0) {
      name += trimmedStr[i].toLowerCase();
    }

    const isUpper = /[A-Z]/.test(trimmedStr[i]);
    const isBlank = trimmedStr[i] === ' ';

    if (isUpper && name.at(-1) !== delimiter) {
      name += delimiter + trimmedStr[i].toLowerCase();
    }

    if (isBlank) {
      name += delimiter;
    }

    name += trimmedStr[i].toLowerCase();
  }

  return name;
}

function setCookie(cname: string, cvalue: unknown, exdays: number): void {
  const date = new Date();
  const name = createCookieName(cname);
  const value = typeof cvalue === 'string' ? cvalue : JSON.stringify(cvalue);
  date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + date.toUTCString();
  document.cookie = name + '=' + value + ';' + expires + ';path=/';
}

function getCookie(cname: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${cname}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? '';
  return '';
}

function deleteCookie(cname: string): void {
  const name = createCookieName(cname);
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

const cookies = { get: getCookie, set: setCookie, delete: deleteCookie };

export default cookies;
