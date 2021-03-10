const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve').default;

module.exports = {
    external: ['Cookie'],
    plugins: [
        resolve(),
        commonjs(),
        json(),
    ],
    output: {
        name: 'breakthrew',
        globals: { 'js-cookie': 'Cookie' },
    },
};
