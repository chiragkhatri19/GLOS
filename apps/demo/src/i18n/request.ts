import { getRequestConfig } from 'next-intl/server';
import i18nConfig from '../../i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale || i18nConfig.defaultLocale;
  return {
    locale,
    messages: (
      await import(`../../messages/${locale}.json`)
    ).default,
  };
});
