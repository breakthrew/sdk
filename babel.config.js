module.exports = api => {
    const isTest = api.env('test');
    if (isTest) {
        return {
            presets: ['@babel/preset-env'],
            plugins: [
                [
                    '@babel/plugin-proposal-class-properties',
                    {
                        loose: true,
                    },
                ],
                ['@babel/plugin-proposal-export-default-from'],
            ],
        };
    }

    return {
        presets: ['@babel/preset-env', 'minify'],
        plugins: [
            [
                '@babel/plugin-proposal-class-properties',
                {
                    loose: true,
                },
            ],
            ['@babel/plugin-proposal-export-default-from'],
        ],
    };
};
