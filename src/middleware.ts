import { NextRequest, NextResponse } from 'next/server';
import { isLocale, resolveLocale } from './lib/i18n';
export function middleware(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('lang');
  const locale = isLocale(query) ? query : resolveLocale(request.cookies.get('oddly-language')?.value);
  const headers = new Headers(request.headers);
  headers.set('x-oddly-locale', locale);
  const response = NextResponse.next({ request: { headers } });
  if (isLocale(query)) response.cookies.set('oddly-language', locale, { maxAge: 60 * 60 * 24 * 365, path: '/', sameSite: 'lax', secure: request.nextUrl.protocol === 'https:' });
  return response;
}
export const config = { matcher: ['/'] };
