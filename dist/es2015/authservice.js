var _class;

import { Keycloak } from './keycloak';
import { noView } from 'aurelia-framework';

export let AuthService = noView(_class = class AuthService {
    constructor() {
        this.kc = {};
    }
    configure(aurelia, config) {
        this.kc = new Keycloak(config.install);
        if (typeof config.initOptions !== 'undefined') {
            this.kc.init(config.initOptions);
        }
    }

}) || _class;