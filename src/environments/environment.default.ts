import { env } from './.env';

export const defaultEnvironment = {
  version: env.npm_package_version,
  defaultLanguage: 'en-US',
  supportedLanguages: ['en-US'],
  serverUrl: '',
};
