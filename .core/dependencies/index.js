import op from 'object-path';
import Reactium, { isBrowserWindow } from 'reactium-core/sdk';
import manifestLoader from 'manifest';

class ReactiumDependencies {
    constructor() {
        this.loaded = false;
        this.actions = {};
        this.actionTypes = {};
        this.services = {};
        this.reducers = {};
        this.plugins = {};
        this.plugableConfig = {};
        this.coreTypes = [
            'allActions',
            'allActionTypes',
            'allReducers',
            'allInitialStates',
            'allServices',
            'allMiddleware',
            'allEnhancers',
            'allPlugins',
        ];
    }

    _init() {
        if (this.loaded) return;

        this.loaded = true;
        this.reducers = op.get(this.manifest, 'allReducers', {});
        this.actions = op.get(this.manifest, 'allActions', {});
        this.actionTypes = Object.keys(
            op.get(this.manifest, 'allActionTypes', {}),
        ).reduce(
            (types, key) => ({
                ...types,
                ...this.manifest.allActionTypes[key],
            }),
            {},
        );
        this.actionTypes.DOMAIN_UPDATE = 'DOMAIN_UPDATE';

        this.services = op.get(this.manifest, 'allServices', {});

        this.plugins = op.get(this.manifest, 'allPlugins', {});

        try {
            let plugableConfig = require('appdir/plugable');
            if ('default' in plugableConfig) {
                plugableConfig = plugableConfig.default;
            }
            this.plugableConfig = plugableConfig;
        } catch (error) {}

        // Resolve non-core types as dependencies
        Object.keys(this.manifest).forEach(type => {
            if (
                !this.coreTypes.find(
                    coreType => coreType === type || type === 'allHooks',
                )
            ) {
                this[type] = op.get(this.manifest, [type], {});
            }
        });

        console.log('Dependencies loaded.');
    }
}

const dependencies = new ReactiumDependencies();

export default () => {
    if (!dependencies.loaded) {
        console.warn(
            new Error('Use of dependencies before dependencies-loaded.'),
        );
        throw dependencyError;
    }

    return dependencies;
};

export const restHeaders = () => {
    return {};
};

// File scoped
try {
    dependencies.manifest = manifestLoader.get();
} catch (error) {
    if (isBrowserWindow()) {
        console.error('Error loading dependencies from manifest.', error);
    } else {
        console.error(
            'Error loading dependencies from manifest on server.',
            error,
        );
    }
}

export const manifest = dependencies.manifest;

Reactium.Hook.register(
    'dependencies-load',
    () =>
        new Promise(resolve => {
            if (dependencies.loaded) resolve();

            const interval = setInterval(() => {
                const loaded =
                    isBrowserWindow() ||
                    Object.entries(dependencies.manifest)
                        .filter(([type]) => type !== 'allHooks')
                        .reduce(
                            (loaded, [, dependency]) => loaded && !!dependency,
                            true,
                        );

                if (loaded) {
                    clearInterval(interval);
                    dependencies._init();
                    resolve();
                }
            }, 10);
        }),
    Reactium.Enums.priority.highest,
);
