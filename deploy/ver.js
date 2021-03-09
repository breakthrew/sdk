const chalk = require('chalk');
const fs = require('fs-extra');
const semver = require('semver');
const op = require('object-path');
const pkg = require('../package');
const inquirer = require('inquirer');

const {
    configFilePath,
    defaultConfig,
    normalize,
    prefix,
    suffix,
    validate,
} = require('./utils');

const env = op.get(process.env, 'NODE_ENV');

const versionUpdater = async () => {
    const type = 'input';
    const pkgFilePath = normalize('package.json');
    const defaultVer = semver.inc(pkg.version, 'patch');

    console.log('');
    console.log(` Deploy ${chalk.magenta(pkg.name)}...`);
    console.log('');

    const config = fs.existsSync(configFilePath)
        ? require('../s3.config')
        : defaultConfig;

    // Get version number
    let { endpoint, key, secret, version } = await inquirer.prompt([
        {
            type,
            prefix,
            suffix,
            type: 'input',
            name: 'version',
            default: defaultVer,
            message: chalk.cyan('Version'),
            validate: val => validate(val, 'version'),
            filter: val => semver.valid(semver.coerce(val)) || defaultVer,
        },
        {
            type,
            prefix,
            suffix,
            name: 'endpoint',
            message: chalk.cyan('AWS Endpoint'),
            default: op.get(config, 'endpoint'),
            validate: val => validate(val, 'endpoint'),
        },
        {
            type,
            prefix,
            suffix,
            name: 'key',
            message: chalk.cyan('Access Key'),
            default: op.get(config, 'key'),
            validate: val => validate(val, 'key'),
        },
        {
            type,
            prefix,
            suffix,
            name: 'secret',
            message: chalk.cyan('Secret Key'),
            default: op.get(config, 'secret'),
            validate: val => validate(val, 'secret'),
        },
    ]);

    // format version
    version = semver.valid(semver.coerce(version));

    // prettier-ignore
    // Write package.json and s3.config.json
    if (env !== 'test') {
        await Promise.all([
            fs.writeFile(pkgFilePath, JSON.stringify({ ...pkg, version }, null, 2)),
            fs.writeFile(configFilePath, JSON.stringify({ endpoint, key, secret }, null, 2)),
        ]);
    }

    console.log('');
    // prettier-ignore
    console.log(` Building ${chalk.magenta(pkg.name)} ${chalk.cyan(version)}...`);
    console.log('');

    if (env === 'test') {
        // prettier-ignore
        console.log(JSON.stringify({ version, endpoint, key, secret }, null, 2));
        console.log('');
    }
};

versionUpdater();
