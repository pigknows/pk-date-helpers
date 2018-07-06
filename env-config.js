const dotenv = require('dotenv');

const appEnv = process.env.APP_ENV || 'local';
const envVariablesPath = `${process.cwd()}/.env.${appEnv}`;
dotenv.config({ path: envVariablesPath });

console.log('[env-config]', 'Loading ENV variables from', envVariablesPath, '...');

module.exports = {
  "process.env.APP_ENV": process.env.APP_ENV,
  "process.env.APP_VERSION": process.env.APP_VERSION || 'dev',
  "process.env.DEFAULT_LOCALE": process.env.DEFAULT_LOCALE || 'en',
  "process.env.NODE_ENV": process.env.NODE_ENV || 'test',
};
