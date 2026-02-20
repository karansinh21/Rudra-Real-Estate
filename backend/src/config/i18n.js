const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales: ['en', 'gu'],
  defaultLocale: 'en',
  directory: path.join(__dirname, '../locales'),
  autoReload: true,
  syncFiles: true,
  objectNotation: true
});

module.exports = i18n;