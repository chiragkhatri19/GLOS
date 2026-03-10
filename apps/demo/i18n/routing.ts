import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'ja', 'de', 'ar', 'fr', 'es'],
  defaultLocale: 'en'
})
