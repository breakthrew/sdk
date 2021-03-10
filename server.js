const chalk = require('chalk');
const moment = require('moment');
const express = require('express');
const porter = require('get-port');
const builder = require('./build');

const serve = async () => {
    await builder(true);

    const defaultPort = process.env.PORT || 3000;
    const port = await porter({ port: defaultPort });

    const app = express();

    app.set('port', port);

    app.use(express.static('static'));

    app.listen(app.get('port') || defaultPort, () => {
        const timestamp = `[${chalk.magenta(moment().format('hh:mm:A'))}]`;
        console.log(
            timestamp,
            'BreakThrew SDK Test',
            chalk.cyan('http://localhost:' + app.get('port')),
            '\n',
        );
    });
};

serve();
