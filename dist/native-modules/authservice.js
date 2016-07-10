var _class;



import { keycloak } from './keycloak';
import { noView } from 'aurelia-framework';

export var AuthService = noView(_class = function () {
    function AuthService(config) {
        

        this.keycloak = null;
    }

    AuthService.prototype.configure = function configure(config) {
        var installURL;
        if (typeof config.install == 'undefined') {
            installURL = 'keycloak.json';
        } else {
            installURL = config.install;
        }
        this.keycloak = Keycloak(installURL);

        if (typeof config.initOption !== 'undefined') {
            this.keycloak.init(config.initOptions);
        }
    };

    return AuthService;
}()) || _class;