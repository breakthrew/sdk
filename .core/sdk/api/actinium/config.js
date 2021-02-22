import { isBrowserWindow } from '@atomic-reactor/reactium-sdk-core';

let apiConfig = {};

/**
 * Isomorphic block of api configuration.
 *
 * @see https://reactium.io/docs/guide/using-apis
 * @see ./index.js for Parse SDK setup
 */
if (isBrowserWindow()) {
    // the api configuration from the browser's perspective
    apiConfig = {
        // [browser]: actinium app id provided by window
        // since 3.2.6
        actiniumAppId: window.actiniumAppId || 'Actinium',

        // [browser]: parse app id provided by window
        // deprecated 3.2.6
        parseAppId: window.parseAppId || 'Actinium',

        // [browser]: REST API base url provided by window
        // if /api default, proxies to REST_API_URL
        restAPI: window.restAPI || '/api',
    };
} else {
    // the api from the server's perspective
    apiConfig = {
        // [server]: default app id for local dev with Actinium
        // since 3.2.6
        actiniumAppId: process.env.ACTINIUM_APP_ID || 'Actinium',

        // [server]: default app id for local dev with Actinium
        // deprecated 3.2.6
        parseAppId: process.env.PARSE_APP_ID || 'Actinium',

        // [server]: default api url for local dev with Actinium
        restAPI: process.env.REST_API_URL || 'http://localhost:9000/api',
    };
}

export default apiConfig;
