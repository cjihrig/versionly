'use strict';
const ChildProcess = require('child_process');
const Path = require('path');

function generate (options) {
  if (!Array.isArray(options)) {
    throw new TypeError('options must be an array');
  }

  const result = {};

  for (let i = 0; i < options.length; i += 2) {
    const type = String(options[i]).trim();
    const field = String(options[i + 1]).trim();
    const index = field.indexOf(':');
    const key = field.substring(0, index < 0 ? field.length : index);
    const value = index < 0 ? null : field.substring(index + 1);

    if (!key) {
      throw new Error(`Invalid entry: '${field}'`);
    }

    if (result[key]) {
      throw new Error(`Duplicate entry: '${key}'`);
    }

    switch (type) {
      case '-a' :
        result[key] = value;
        break;

      case '-d' :
        const date = new Date();
        let formatted;

        switch (value) {
          case null :
          case '' :
          case 'now' :
            formatted = String(date.valueOf());
            break;
          case 'iso' :
            formatted = date.toISOString();
            break;
          case 'locale' :
            formatted = date.toLocaleString();
            break;
          case 'localedate' :
            formatted = date.toLocaleDateString();
            break;
          case 'localetime' :
            formatted = date.toLocaleTimeString();
            break;
          case 'time' :
            formatted = date.toTimeString();
            break;
          case 'utc' :
            formatted = date.toUTCString();
            break;
          default :
            throw new Error(`Unexpected date format: '${value}'`);
        }

        result[key] = formatted;
        break;

      case '-e' :
        const envVar = process.env[value];

        if (!envVar) {
          throw new Error(`Unknown environment variable: '${value}'`);
        }

        result[key] = envVar;
        break;

      case '-g' :
        let head = null;

        try {
          head = ChildProcess.execSync('git rev-parse HEAD').toString().trim();
        } catch (ignoreErr) {
          throw new Error('Cannot parse git history');
        }

        result[field] = head;
        break;

      case '-p' :
        const packagePath = Path.resolve(value || 'package.json');
        let packageVersion = null;

        try {
          packageVersion = require(packagePath).version || null;
        } catch (ignoreErr) {
          throw new Error(`Cannot load package from: '${packagePath}'`);
        }

        result[key] = packageVersion;
        break;

      default :
        throw new Error(`Unexpected input: '${type} ${field}'`);
    }
  }

  return result;
}

module.exports = { generate };
