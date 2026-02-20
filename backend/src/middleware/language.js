const i18n = require('../config/i18n');

const setLanguage = (req, res, next) => {
  const lang = req.headers['accept-language'] || req.query.lang || 'en';
  i18n.setLocale(lang);
  req.__ = i18n.__;
  next();
};

module.exports = { setLanguage };