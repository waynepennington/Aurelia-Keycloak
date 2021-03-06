'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AuthService = undefined;
exports.configure = configure;

var _authservice = require('./authservice');

function configure(aurelia, config) {
    var instance = aurelia.container.get(_authservice.AuthService);
    instance.configure(aurelia, config);
}
exports.AuthService = _authservice.AuthService;