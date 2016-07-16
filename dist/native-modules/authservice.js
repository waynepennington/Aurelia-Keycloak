var _class;



import { keycloak } from './keycloak';
import { noView } from 'aurelia-framework';

export var AuthService = noView(_class = function () {
    function AuthService() {
        

        this.kc = {};
    }

    AuthService.prototype.configure = function configure(aurelia, config) {
        this.kc = new keycloak(config.install);
        if (typeof config.initOptions !== 'undefined') {
            this.kc.init(config.initOptions);
        }
    };

    return AuthService;
}()) || _class;