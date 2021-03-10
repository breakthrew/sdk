import Cookie from 'js-cookie';
import { version } from '../package.json';

let breakthrew;

(function() {
    let A;
    let Q = [];

    let STATUS = 'READY';
    let DOMAIN = 'api.brkthrw.io';

    const isStatus = check => {
        check = Array.isArray(check) ? check : [check];
        return check.includes(STATUS);
    };

    const setDomain = newDomain => {
        DOMAIN = newDomain;
    };

    const setStatus = newStatus => {
        STATUS = newStatus;
    };

    const queryParams = () => {
        let params = {};

        const query =
            typeof window !== 'undefined' ? window.location.search : null;

        if (query !== null) {
            let match;
            const regex = /[?&;](.+?)=([^&;]+)/g;

            while ((match = regex.exec(query))) {
                const key = match[1];
                const val = decodeURIComponent(match[2]);

                if (typeof params[key] !== 'undefined') {
                    if (!Array.isArray(params[key])) {
                        params[key] = Array.from(params[key]);
                    }
                    params[key].push(val);
                } else {
                    params[key] = val;
                }
            }
        }

        return params;
    };

    const API = (endpoint, body) => {
        if (!A) {
            return Promise.reject({
                message: 'BreakThrew AppID is undefined',
                code: 403,
            });
        }

        const PORT = DOMAIN === 'localhost' ? `:${9000}` : '';
        const PROTO = DOMAIN === 'localhost' ? 'http://' : '//';

        // prettier-ignore
        const URL = `${PROTO}${DOMAIN}${PORT}${String(endpoint).substr(1) !== '/' ? `/${endpoint}` : endpoint}`;

        // prettier-ignore
        const DATA = body ? Object.entries(body).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&') : {};

        const HEADERS = ['Content-Type', 'application/x-www-form-urlencoded'];

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', URL, true);
            xhr.setRequestHeader(...HEADERS);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject({ message: xhr.statusText, code: xhr.status });
                    }
                }
            };
            xhr.send(DATA);
        });
    };

    class BREAKTHREW {
        constructor(a, q) {
            A = a;
            Q = q || [];

            const { brkthrw = null } = queryParams();
            if (brkthrw !== null) setDomain(brkthrw);

            if (typeof window !== 'undefined') {
                window.removeEventListener('load', this.load);
                window.removeEventListener('beforeunload', this.unload);

                window.addEventListener('load', this.load);
                window.addEventListener('beforeunload', this.unload);
            }
        }

        get init() {
            return a => {
                A = a;
                return this;
            };
        }

        get push() {
            return (...args) => {
                if (args.length > 0) {
                    const info = {
                        referrer: null,
                        timestamp: Date.now(),
                    };

                    if (typeof window !== 'undefined') {
                        info.referrer =
                            document.referrer || window.location.href;
                    }

                    args.push(info);
                    Q.push(args);
                }
                return this;
            };
        }

        get q() {
            return Q;
        }

        get app() {
            return A;
        }

        get send() {
            return async (...args) => {
                this.push(...args);
                if (this.q.length < 1 || !isStatus('READY')) return this;

                Q = [];

                setStatus('BUSY');
                await API('track', {
                    app: this.app,
                    events: this.q,
                    token: this.token,
                    timestamp: Date.now(),
                });
                setStatus('READY');

                return this;
            };
        }

        get token() {
            return Cookie.get('brkthrw', { domain: DOMAIN });
        }

        set token(value) {
            Cookie.set('brkthrw', value, { domain: DOMAIN });
        }

        get load() {
            return async () => {
                if (typeof document === 'undefined') return this;

                if (!this.token) {
                    const { token } = await API('token');
                    this.token = token;
                }

                this.push('enter', document.URL);

                return this;
            };
        }

        get unload() {
            return () => {
                if (typeof document === 'undefined') return this;

                setStatus('READY');
                this.send('exit', document.URL);

                return this;
            };
        }

        get version() {
            return version;
        }
    }

    const { app, q } =
        typeof window !== 'undefined' && typeof window.brkthrw !== 'undefined'
            ? window.brkthrw
            : { app: 'breakthrew', q: [] };

    breakthrew = new BREAKTHREW(app, q);

    if (typeof window !== 'undefined') {
        window.brkthrw = breakthrew;
    }

    return breakthrew;
})();

export default breakthrew;
