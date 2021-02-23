import Cookie from 'js-cookie';

let A;
let Q = [];
let breakthrew;
let STATUS = 'READY';

const DOMAIN = 'localhost';

const setStatus = newStatus => {
    STATUS = newStatus;
};

const isStatus = check => {
    check = Array.isArray(check) ? check : [check];
    return check.includes(STATUS);
};

const API = (endpoint, body) => {
    if (!A) {
        return Promise.reject({
            message: 'BreakThrew AppID is undefined',
            code: 403,
        });
    }

    const PORT = DOMAIN === 'localhost' ? `:${9000}` : '';

    // prettier-ignore
    const URL = `//${DOMAIN}${PORT}${String(endpoint).substr(1) !== '/' ? `/${endpoint}` : endpoint}`;

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

class SDK {
    constructor(a, q) {
        A = a;
        Q = q || [];

        if (typeof window !== 'undefined') {
            window.addEventListener('load', e => this.load(e));
            window.addEventListener('beforeunload', e => this.unload(e));
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
                args.push(Date.now());
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
            if (args.length > 0) this.push(...args);
            if (this.q.length < 1 || !isStatus('READY')) return this;

            const pl = this.q;
            const app = this.app;
            const ts = Date.now();

            Q = [];

            setStatus('BUSY');
            await API('track', { pl, ts, tk: this.token, app: this.app });
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
}

(function() {
    const { app, q } =
        typeof window !== 'undefined' && typeof window.brkthrw !== 'undefined'
            ? window.brkthrw
            : { app: 'breakthrew', q: [] };

    breakthrew = new SDK(app, q);

    if (typeof window !== 'undefined') {
        window.brkthrw = breakthrew;
    }

})();

export default breakthrew;
