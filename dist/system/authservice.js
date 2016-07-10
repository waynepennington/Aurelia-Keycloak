'use strict';

System.register(['./keycloak', 'aurelia-framework'], function (_export, _context) {
    "use strict";

    var keycloak, noView, AuthService;

    

    return {
        setters: [function (_keycloak) {
            keycloak = _keycloak.keycloak;
        }, function (_aureliaFramework) {
            noView = _aureliaFramework.noView;
        }],
        execute: function () {
            _export('AuthService', AuthService = function () {
                function AuthService() {
                    

                    this.keycloak = null;
                }

                AuthService.prototype.configure = function configure(config) {
                    var installURL;
                    if (typeof config.install == 'undefined') {
                        installURL = 'keycloak.json';
                    } else {
                        installURL = config.install;
                    }
                    this.keycloak = new Keycloak(installURL);

                    if (typeof config.initOption !== 'undefined') {
                        this.keycloak.init(config.initOptions);
                    }
                };

                return AuthService;
            }());

            _export('AuthService', AuthService);
        }
    };
});