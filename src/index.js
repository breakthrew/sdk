import moment from 'moment';
import Cookie from 'js-cookie';
import { version } from '../package.json';

let breakthrew;

(function() {
    let A;
    let I;
    let Q = [];

    let STATUS = 'READY';
    let DOMAIN = 'api.brkthrw.io';

    const isIE = () => window.navigator.userAgent.indexOf('MSIE ') > -1;

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

    const API = (endpoint, body, method) => {
        if (!A) {
            return Promise.reject({
                message: 'BreakThrew AppID is undefined',
                code: 403,
            });
        }

        method = method || 'POST';
        const PROTO = DOMAIN === 'localhost' ? 'http://' : 'https://';
        const PORT = DOMAIN === 'localhost' ? `:${9000}` : '';

        // prettier-ignore
        const URL = `${PROTO}${DOMAIN}${PORT}${String(endpoint).substr(1) !== '/' ? `/${endpoint}` : endpoint}`;

        // prettier-ignore
        const DATA = body ? Object.entries(body).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&') : {};

        const HEADERS = [['Content-Type', 'application/x-www-form-urlencoded']];

        if (isIE()) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open(method, URL, true);
                HEADERS.forEach(header => xhr.setRequestHeader(...header));
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            resolve(JSON.parse(xhr.responseText));
                        } else {
                            reject({
                                message: xhr.statusText,
                                code: xhr.status,
                            });
                        }
                    }
                };
                xhr.send(DATA);
            });
        } else {
            const headers = new Headers();
            HEADERS.forEach(header => headers.append(...header));

            const req = new Request(URL);
            const opt = {
                method,
                headers,
                body: DATA,
                mode: 'cors',
                keepalive: true,
                cache: 'default',
            };

            return fetch(req, opt);
        }
    };

    class BREAKTHREW {
        constructor(a, q) {
            A = a;
            Q = q || [];

            const { brkthrw = null } = queryParams();
            if (brkthrw !== null) setDomain(brkthrw);

            if (typeof window !== 'undefined') {
                window.addEventListener('load', this.load);
                window.addEventListener('unload', this.unload);
                if (isIE()) {
                    I = setInterval(this.send, 250);
                }
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
                        // prettier-ignore
                        info.referrer = document.referrer || window.location.href;
                        info.url = window.location.href;
                    }

                    args.push(info);
                    Q.push(args);
                }
                return this;
            };
        }

        get q() {
            return Array.from(Q);
        }

        get app() {
            return A;
        }

        get send() {
            return async (...args) => {
                this.push(...args);

                if (this.q.length < 1 || !isStatus('READY')) return this;

                const events = JSON.stringify(this.q);

                Q = [];

                setStatus('BUSY');
                await API('track', {
                    events,
                    app: this.app,
                    token: this.token,
                    session: this.session,
                });
                setStatus('READY');

                return this;
            };
        }

        get session() {
            let s = Number(Cookie.get('brkthrw-session') || Date.now());
            const diff = Math.abs(moment().diff(moment(s), 'days'));

            s = diff >= 1 ? Date.now() : s;
            Cookie.set('brkthrw-session', s);
            return Number(s);
        }

        get token() {
            return Cookie.get('brkthrw');
        }

        set token(value) {
            Cookie.set('brkthrw', value);
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
            return async () => {
                if (isIE()) clearInterval(I);

                if (typeof document === 'undefined') return this;

                setStatus('READY');
                await this.send('exit', document.URL);
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
