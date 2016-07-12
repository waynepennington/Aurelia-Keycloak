'use strict';

System.register(['./keycloakfunction'], function (_export, _context) {
    "use strict";

    var keycloak, AuthService;

    

    return {
        setters: [function (_keycloakfunction) {
            keycloak = _keycloakfunction.keycloak;
        }],
        execute: function () {
            _export('AuthService', AuthService = function () {
                function AuthService() {
                    

                    this.Keycloak = null;
                }

                AuthService.prototype.configure = function configure(config) {
                    this.Keycloak = new Keycloak(config.install);

                    console.log('INFO Keycloak authentication client installation configuration loaded');
                    if (typeof config.initOptions !== 'undefined') {
                        this.Keycloak.init(config.initOptions);
                        console.log('INFO Keycloak initialization options loaded');
                        console.log('INFO ' + config.initOptions);
                    }
                };

                AuthService.prototype.loadKeycloakScript = function loadKeycloakScript() {
                    if (window.Keycloak === undefined) {
                        var script = document.createElement('script');

                        script.type = 'text/javascript';
                        script.async = false;
                        script.defer = false;
                        script.src = './src/keycloak.js';

                        document.body.appendChild(script);
                    }
                };

                return AuthService;
            }());

            _export('AuthService', AuthService);
        }
    };
});