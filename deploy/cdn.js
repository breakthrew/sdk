const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const semver = require('semver');
const pkg = require('../package');
const op = require('object-path');
const inquirer = require('inquirer');
const S3 = require('aws-sdk/clients/s3');

const normalize = (...args) =>
    path.normalize(path.join(process.cwd(), ...args));

const deploy = async () => {
    const pkgPath = normalize('package.json');
    const distPath = normalize('dist', 'brkthrw.min.js');
    const defaultPath = normalize('deploy', 's3.config.json');

    const defaults = fs.existsSync(defaultPath)
        ? require('./s3.config')
        : {
              endpoint: 'sfo3.digitaloceanspaces.com',
          };

    const defaultVer = semver.inc(pkg.version, 'patch');

    console.log('');

    const validate = (val, field) => (!val ? `${field} is required` : true);
    const validateVer = val =>
        semver.valid(val) ? true : `invalid version: ${chalk.magenta(val)}`;

    const prefix = chalk.magenta('   > ');
    const suffix = chalk.magenta(': ');

    console.log(` Deploy ${chalk.magenta(pkg.name)}...`);
    console.log('');

    const { endpoint, key, secret, version } = await inquirer.prompt([
        {
            prefix,
            suffix,
            type: 'input',
            name: 'endpoint',
            message: chalk.cyan('S3 Endpoint'),
            default: op.get(defaults, 'endpoint'),
            validate: val => validate(val, 'endpoint'),
        },
        {
            prefix,
            suffix,
            name: 'key',
            type: 'input',
            message: chalk.cyan('Access Key'),
            default: op.get(defaults, 'key'),
            validate: val => validate(val, 'key'),
        },
        {
            prefix,
            suffix,
            name: 'secret',
            type: 'input',
            message: chalk.cyan('Secret Key'),
            default: op.get(defaults, 'secret'),
            validate: val => validate(val, 'secret'),
        },
        {
            prefix,
            suffix,
            type: 'input',
            name: 'version',
            default: defaultVer,
            message: chalk.cyan('Version'),
            validate: val => validateVer(val),
        },
    ]);

    console.log('');
    const spinner = ora(` updating ${chalk.magenta('package.json')}...`);
    spinner.indent = 1;
    spinner.start();

    await Promise.all([
        fs.writeFile(
            defaultPath,
            JSON.stringify({ endpoint, key, secret }, null, 2),
        ),
        fs.writeFile(pkgPath, JSON.stringify({ ...pkg, version }, null, 2)),
    ]);

    const [err] = await new Promise(resolve => {
        spinner.text = `deploying version ${chalk.cyan(
            version,
        )} to ${chalk.magenta(endpoint)}...`;

        const s3 = new S3({
            endpoint,
            accessKeyId: key,
            secretAccessKey: secret,
        });

        const fileObj = {
            ACL: 'public-read',
            Body: fs.readFileSync(distPath),
            Bucket: 'brkthrw',
            Key: 'brkthrw.min.js',
        };

        s3.putObject(fileObj, (err, data) => resolve([err, data]));
    });

    if (!err) {
        spinner.succeed(
            ` deployed ${chalk.magenta(pkg.name)}@${chalk.cyan(version)}`,
        );
    } else {
        spinner.fail(
            ` deployment ${chalk.magenta(pkg.name)}@${chalk.cyan(
                version,
            )} failed!`,
        );

        console.log('');
        console.log(err.message);
        console.log('');

        process.exit();
    }
    console.log('');
};

deploy();
