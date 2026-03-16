import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only support 6 locales for demo
  const supportedLocales = ['en', 'ja', 'de', 'fr', 'es', 'ar']
  const localePattern = `\\/(${supportedLocales.join('|')})`
  const pathnameHasLocale = new RegExp(`^${localePattern}(\/|$)`).test(pathname)
  
  if (pathnameHasLocale) return NextResponse.next()
  
  // Skip static files and api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Default to /en for root or unknown paths
  const locale = 'en'
  
  // Redirect to localized version
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: ['/((?!_next|api|public|\\.).*)'],
}
