var _dec, _class;

import { keycloak } from './keycloak';
import { LogManager } from 'aurelia-framework';
import { inject } from 'aurelia-framework';

export let AuthService = (_dec = inject(keycloak, LogManager), _dec(_class = class AuthService {
    constructor(kc, LogManager) {
        let logger = LogManager.getLogger('AuthService');
        console.log("GOT THIS FAR");
        let keycloak = new kc.Keycloak();
    }
    configure(config) {
        keycloak(config.install);
        if (typeof config.initOption !== 'undefined') {
            this.keycloak.init(config.initOptions);
        }
    }
}) || _class);