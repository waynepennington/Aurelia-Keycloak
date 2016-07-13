'use strict';

System.register([], function (_export, _context) {
    "use strict";

    var AuthService;

    

    return {
        setters: [],
        execute: function () {
            function configure(aurelia, config) {
                var instance = aurelia.container.get(AuthService);
                instance.configure(config);
                aurelia.globalResources('./aurelia-keycloak');
            }

            _export('configure', configure);

            _export('AuthService', AuthService = function () {
                function AuthService() {
                    

                    this.Keycloak = importKeycloak();
                }

                AuthService.prototype.configure = function configure(config) {
                    this.Keycloak = new Keycloak(config.install);
                    if (typeof config.initOptions !== 'undefined') {
                        this.Keycloak.init(config.initOptions);
                    }
                };

                AuthService.prototype.importKeycloak = function importKeycloak() {
                    return function () {
                        var script = document.createElement('script');

                        script.type = 'text/javascript';
                        script.async = false;
                        script.defer = false;
                        script.src = './src/keycloak.js';

                        document.body.appendChild(script);
                    };
                };

                return AuthService;
            }());

            _export('AuthService', AuthService);
        }
    };
});