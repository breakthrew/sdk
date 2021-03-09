const path = require('path');
const chalk = require('chalk');
const semver = require('semver');

// prettier-ignore
const normalize = (...args) => path.normalize(path.join(process.cwd(), ...args));

const utils = {
    configFilePath: normalize('s3.config.json'),

    defaultConfig: {
        endpoint: 'sfo3.digitaloceanspaces.com',
    },

    normalize,

    prefix: chalk.magenta('   > '),

    suffix: chalk.magenta(': '),

    validate: (val, field) => {
        switch (field) {
            case 'version':
                return !semver.valid(semver.coerce(val))
                    ? `invalid version: ${chalk.magenta(val)}`
                    : true;

            default:
                return !val ? `${field} is required` : true;
        }
    },
};

module.exports = utils;
