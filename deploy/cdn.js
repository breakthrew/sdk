const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs-extra');
const pkg = require('../package');
const config = require('../s3.config');
const AWS = require('aws-sdk/clients/s3');

const { normalize } = require('./utils');

const deploy = async () => {
    const { endpoint, key, secret } = config;
    const distFilePath = normalize('dist', 'brkthrw.min.js');

    // prettier-ignore
    const spinner = ora(`deploying version ${chalk.cyan(pkg.version)} to ${chalk.magenta(endpoint)}...`);
    spinner.indent = 1;
    spinner.start();

    const [err] = await new Promise(resolve => {
        let err;
        let complete = 0;

        const S3 = new AWS({
            endpoint,
            accessKeyId: key,
            secretAccessKey: secret,
        });

        const fileObj = {
            Bucket: 'brkthrw',
            ACL: 'public-read',
            Key: 'brkthrw.min.js',
            Body: fs.readFileSync(distFilePath),
        };

        const done = (error, data) => {
            complete += 1;
            err = error || err;
            if (complete === 2) resolve([err, data]);
        };

        // prettier-ignore
        S3.putObject({ ...fileObj, Key: `ver/brkthrw.${pkg.version}.min.js`}, done);
        S3.putObject(fileObj, done);
    });

    if (!err) {
        // prettier-ignore
        spinner.succeed(` deployed ${chalk.magenta(pkg.name)} ${chalk.cyan(pkg.version)}`);
    } else {
        // prettier-ignore
        spinner.fail(` deployment ${chalk.magenta(pkg.name)} ${chalk.cyan(pkg.version)} failed!`);

        console.log('');
        console.log('\t', err.message);
        console.log('');

        process.exit();
    }
    console.log('');
};

deploy();
