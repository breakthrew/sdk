const path = require('path');
const fs = require('fs-extra');
const rollup = require('rollup');
const babel = require('@babel/core');
const rollupConfig = require('./rollup.config.js');
const { uglify } = require('rollup-plugin-uglify');

const normalize = (...args) =>
    path.normalize(path.join(process.cwd(), ...args));

const build = async (isStatic = false) => {
    const inputOpts = {
        ...rollupConfig,
        input: 'build/brkthrw.js',
        output: null,
    };

    const outputOpts = [];

    const { code } = babel.transformFileSync('src/index.js', {
        presets: ['@babel/preset-env'],
        plugins: [
            ['@babel/plugin-transform-runtime'],
            [
                '@babel/plugin-proposal-class-properties',
                {
                    loose: true,
                },
            ],
            ['@babel/plugin-proposal-export-default-from'],
        ],
    });

    fs.ensureDirSync(normalize('build'));
    fs.writeFileSync(normalize('build', 'brkthrw.js'), code);

    if (isStatic !== true) {
        inputOpts.plugins.push(uglify());

        outputOpts.push({
            ...rollupConfig.output,
            format: 'iife',
            file: 'dist/brkthrw.min.js',
        });

        outputOpts.push({
            ...rollupConfig.output,
            format: 'umd',
            file: 'lib/index.js',
        });
    } else {
        outputOpts.push({
            ...rollupConfig.output,
            format: 'iife',
            file: 'static/brkthrw.js',
        });
    }

    const bundle = await rollup.rollup(inputOpts);

    await Promise.all(outputOpts.map(opt => bundle.write(opt)));
};

module.exports = build;
