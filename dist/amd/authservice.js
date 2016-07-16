define(['exports', './PersistentStorage', './CallbackParser'], function (exports, _PersistentStorage, _CallbackParser) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.AuthService = undefined;

    

    var AuthService = exports.AuthService = function () {
        function AuthService() {
            

            this.authenticated = false;
            this.config;
            this.adapter;
            this.refreshQueue = [];
            this.storage;
            this.loginIframe = {
                enable: true,
                callbackMap: [],
                interval: 5
            };
            this.callback_id = 0;
        }

        AuthService.prototype.configure = function configure(configKC) {
            this.config = configKC.install;
            if (typeof configKC.initOptions !== 'undefined') {
                this.init(configKC.initOptions);
            }
        };

        AuthService.prototype.init = function init(initOptions) {
            this.authenticated = false;
            storage = new _PersistentStorage.PersistentStorage();
            if (initOptions && initOptions.adapter === 'cordova') {
                adapter = loadAdapter('cordova');
            } else if (initOptions && initOptions.adapter === 'default') {
                adapter = loadAdapter();
            } else {
                if (window.Cordova) {
                    adapter = loadAdapter('cordova');
                } else {
                    adapter = loadAdapter();
                }
            }
            if (initOptions) {
                if (typeof initOptions.checkLoginIframe !== 'undefined') {
                    loginIframe.enable = initOptions.checkLoginIframe;
                }
                if (initOptions.checkLoginIframeInterval) {
                    loginIframe.interval = initOptions.checkLoginIframeInterval;
                }
                if (initOptions.onLoad === 'login-required') {
                    this.loginRequired = true;
                }
                if (initOptions.responseMode) {
                    if (initOptions.responseMode === 'query' || initOptions.responseMode === 'fragment') {
                        this.responseMode = initOptions.responseMode;
                    } else {
                        throw 'Invalid value for responseMode';
                    }
                }
                if (initOptions.flow) {
                    switch (initOptions.flow) {
                        case 'standard':
                            this.responseType = 'code';
                            break;
                        case 'implicit':
                            this.responseType = 'id_token token';
                            break;
                        case 'hybrid':
                            this.responseType = 'code id_token token';
                            break;
                        default:
                            throw 'Invalid value for flow';
                    }
                    this.flow = initOptions.flow;
                }
            }
            if (!this.responseMode) {
                this.responseMode = 'fragment';
            }
            if (!this.responseType) {
                this.responseType = 'code';
                this.flow = 'standard';
            }
            var p_romise = createP_romise();
            var initP_romise = createP_romise();
            initP_romise.p_romise.success(function () {
                this.onReady && this.onReady(this.authenticated);
                p_romise.setSuccess(this.authenticated);
            }).error(function () {
                p_romise.setError();
            });
            var configP_romise = loadConfig(config);
            function onLoad() {
                var doLogin = function doLogin(prompt) {
                    if (!prompt) {
                        options.prompt = 'none';
                    }
                    this.login(options).success(function () {
                        initP_romise.setSuccess();
                    }).error(function () {
                        initP_romise.setError();
                    });
                };
                var options = {};
                switch (initOptions.onLoad) {
                    case 'check-sso':
                        if (loginIframe.enable) {
                            setupCheckLoginIframe().success(function () {
                                checkLoginIframe().success(function () {
                                    doLogin(false);
                                }).error(function () {
                                    initP_romise.setSuccess();
                                });
                            });
                        } else {
                            doLogin(false);
                        }
                        break;
                    case 'login-required':
                        doLogin(true);
                        break;
                    default:
                        throw 'Invalid value for onLoad';
                }
            }
            function processInit() {
                var callback = parseCallback(window.location.href);
                if (callback) {
                    setupCheckLoginIframe();
                    window.history.replaceState({}, null, callback.newUrl);
                    processCallback(callback, initP_romise);
                    return;
                } else if (initOptions) {
                    if (initOptions.token || initOptions.refreshToken) {
                        setToken(initOptions.token, initOptions.refreshToken, initOptions.idToken, false);
                        this.timeSkew = initOptions.timeSkew || 0;
                        if (loginIframe.enable) {
                            setupCheckLoginIframe().success(function () {
                                checkLoginIframe().success(function () {
                                    initP_romise.setSuccess();
                                }).error(function () {
                                    if (initOptions.onLoad) {
                                        onLoad();
                                    }
                                });
                            });
                        } else {
                            initP_romise.setSuccess();
                        }
                    } else if (initOptions.onLoad) {
                        onLoad();
                    } else {
                        initP_romise.setSuccess();
                    }
                } else {
                    initP_romise.setSuccess();
                }
            }
            configP_romise.success(processInit);
            configP_romise.error(function () {
                p_romise.setError();
            });
            return p_romise.p_romise;
        };

        AuthService.prototype.login = function login(options) {
            return adapter.login(options);
        };

        AuthService.prototype.createLoginUrl = function createLoginUrl(options) {
            var state = createUUID();
            var nonce = createUUID();
            var redirectUri = adapter.redirectUri(options);
            if (options && options.prompt) {
                redirectUri += (redirectUri.indexOf('?') == -1 ? '?' : '&') + 'prompt=' + options.prompt;
            }
            storage.setItem('oauthState', JSON.stringify({ state: state, nonce: nonce, redirectUri: encodeURIComponent(redirectUri) }));
            var action = 'auth';
            if (options && options.action == 'register') {
                action = 'registrations';
            }
            var url = getRealmUrl() + '/protocol/openid-connect/' + action + '?client_id=' + encodeURIComponent(this.clientId) + '&redirect_uri=' + encodeURIComponent(redirectUri) + '&state=' + encodeURIComponent(state) + '&nonce=' + encodeURIComponent(nonce) + '&response_mode=' + encodeURIComponent(this.responseMode) + '&response_type=' + encodeURIComponent(this.responseType);
            if (options && options.prompt) {
                url += '&prompt=' + encodeURIComponent(options.prompt);
            }
            if (options && options.loginHint) {
                url += '&login_hint=' + encodeURIComponent(options.loginHint);
            }
            if (options && options.idpHint) {
                url += '&kc_idp_hint=' + encodeURIComponent(options.idpHint);
            }
            if (options && options.scope) {
                url += '&scope=' + encodeURIComponent(options.scope);
            }
            if (options && options.locale) {
                url += '&ui_locales=' + encodeURIComponent(options.locale);
            }
            return url;
        };

        AuthService.prototype.logout = function logout(options) {
            return adapter.logout(options);
        };

        AuthService.prototype.createLogoutUrl = function createLogoutUrl(options) {
            var url = getRealmUrl() + '/protocol/openid-connect/logout' + '?redirect_uri=' + encodeURIComponent(adapter.redirectUri(options, false));
            return url;
        };

        AuthService.prototype.register = function register(options) {
            return adapter.register(options);
        };

        AuthService.prototype.createRegisterUrl = function createRegisterUrl(options) {
            if (!options) {
                options = {};
            }
            options.action = 'register';
            return this.createLoginUrl(options);
        };

        AuthService.prototype.createAccountUrl = function createAccountUrl(options) {
            var url = getRealmUrl() + '/account' + '?referrer=' + encodeURIComponent(this.clientId) + '&referrer_uri=' + encodeURIComponent(adapter.redirectUri(options));
            return url;
        };

        AuthService.prototype.accountManagement = function accountManagement() {
            return adapter.accountManagement();
        };

        AuthService.prototype.hasRealmRole = function hasRealmRole(role) {
            var access = this.realmAccess;
            return !!access && access.roles.indexOf(role) >= 0;
        };

        AuthService.prototype.hasResourceRole = function hasResourceRole(role, resource) {
            if (!this.resourceAccess) {
                return false;
            }
            var access = this.resourceAccess[resource || this.clientId];
            return !!access && access.roles.indexOf(role) >= 0;
        };

        AuthService.prototype.loadUserProfile = function loadUserProfile() {
            var url = getRealmUrl() + '/account';
            var req = new XMLHttpRequest();
            req.open('GET', url, true);
            req.setRequestHeader('Accept', 'application/json');
            req.setRequestHeader('Authorization', 'bearer ' + this.token);
            var p_romise = createP_romise();
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    if (req.status == 200) {
                        this.profile = JSON.parse(req.responseText);
                        p_romise.setSuccess(this.profile);
                    } else {
                        p_romise.setError();
                    }
                }
            };
            req.send();
            return p_romise.p_romise;
        };

        AuthService.prototype.loadUserInfo = function loadUserInfo() {
            var url = getRealmUrl() + '/protocol/openid-connect/userinfo';
            var req = new XMLHttpRequest();
            req.open('GET', url, true);
            req.setRequestHeader('Accept', 'application/json');
            req.setRequestHeader('Authorization', 'bearer ' + this.token);
            var p_romise = createP_romise();
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    if (req.status == 200) {
                        this.userInfo = JSON.parse(req.responseText);
                        p_romise.setSuccess(this.userInfo);
                    } else {
                        p_romise.setError();
                    }
                }
            };
            req.send();
            return p_romise.p_romise;
        };

        AuthService.prototype.isTokenExpired = function isTokenExpired(minValidity) {
            if (!this.tokenParsed || !this.refreshToken && this.flow != 'implicit') {
                throw 'Not authenticated';
            }
            var expiresIn = this.tokenParsed['exp'] - new Date().getTime() / 1000 + this.timeSkew;
            if (minValidity) {
                expiresIn -= minValidity;
            }
            return expiresIn < 0;
        };

        AuthService.prototype.updateToken = function updateToken(minValidity) {
            var p_romise = createP_romise();
            if (!this.tokenParsed || !this.refreshToken) {
                p_romise.setError();
                return p_romise.p_romise;
            }
            minValidity = minValidity || 5;
            var exec = function exec() {
                if (!this.isTokenExpired(minValidity)) {
                    p_romise.setSuccess(false);
                } else {
                    var params = 'grant_type=refresh_token&' + 'refresh_token=' + this.refreshToken;
                    var url = getRealmUrl() + '/protocol/openid-connect/token';
                    refreshQueue.push(p_romise);
                    if (refreshQueue.length == 1) {
                        var req = new XMLHttpRequest();
                        req.open('POST', url, true);
                        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                        if (this.clientId && this.clientSecret) {
                            req.setRequestHeader('Authorization', 'Basic ' + btoa(this.clientId + ':' + this.clientSecret));
                        } else {
                            params += '&client_id=' + encodeURIComponent(this.clientId);
                        }
                        var timeLocal = new Date().getTime();
                        req.onreadystatechange = function () {
                            if (req.readyState == 4) {
                                if (req.status == 200) {
                                    timeLocal = (timeLocal + new Date().getTime()) / 2;
                                    var tokenResponse = JSON.parse(req.responseText);
                                    setToken(tokenResponse['access_token'], tokenResponse['refresh_token'], tokenResponse['id_token'], true);
                                    this.timeSkew = Math.floor(timeLocal / 1000) - this.tokenParsed.iat;
                                    this.onAuthRefreshSuccess && this.onAuthRefreshSuccess();
                                    for (var p = refreshQueue.pop(); p != null; p = refreshQueue.pop()) {
                                        p.setSuccess(true);
                                    }
                                } else {
                                    this.onAuthRefreshError && this.onAuthRefreshError();
                                    for (var p = refreshQueue.pop(); p != null; p = refreshQueue.pop()) {
                                        p.setError(true);
                                    }
                                }
                            }
                        };
                        req.send(params);
                    }
                }
            };
            if (loginIframe.enable) {
                var iframeP_romise = checkLoginIframe();
                iframeP_romise.success(function () {
                    exec();
                }).error(function () {
                    p_romise.setError();
                });
            } else {
                exec();
            }
            return p_romise.p_romise;
        };

        AuthService.prototype.clearToken = function clearToken() {
            if (this.token) {
                setToken(null, null, null, true);
                this.onAuthLogout && this.onAuthLogout();
                if (this.loginRequired) {
                    this.login();
                }
            }
        };

        AuthService.prototype.getRealmUrl = function getRealmUrl() {
            if (this.authServerUrl.charAt(this.authServerUrl.length - 1) == '/') {
                return this.authServerUrl + 'realms/' + encodeURIComponent(this.realm);
            } else {
                return this.authServerUrl + '/realms/' + encodeURIComponent(this.realm);
            }
        };

        AuthService.prototype.getOrigin = function getOrigin() {
            if (!window.location.origin) {
                return window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            } else {
                return window.location.origin;
            }
        };

        AuthService.prototype.processCallback = function processCallback(oauth, p_romise) {
            var code = oauth.code;
            var error = oauth.error;
            var prompt = oauth.prompt;
            var timeLocal = new Date().getTime();
            if (error) {
                if (prompt != 'none') {
                    this.onAuthError && this.onAuthError();
                    p_romise && p_romise.setError();
                } else {
                    p_romise && p_romise.setSuccess();
                }
                return;
            } else if (this.flow != 'standard' && (oauth.access_token || oauth.id_token)) {
                authSuccess(oauth.access_token, null, oauth.id_token, true);
            }
            if (this.flow != 'implicit' && code) {
                var params = 'code=' + code + '&grant_type=authorization_code';
                var url = getRealmUrl() + '/protocol/openid-connect/token';
                var req = new XMLHttpRequest();
                req.open('POST', url, true);
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                if (this.clientId && this.clientSecret) {
                    req.setRequestHeader('Authorization', 'Basic ' + btoa(this.clientId + ':' + this.clientSecret));
                } else {
                    params += '&client_id=' + encodeURIComponent(this.clientId);
                }
                params += '&redirect_uri=' + oauth.redirectUri;
                req.withCredentials = true;
                req.onreadystatechange = function () {
                    if (req.readyState == 4) {
                        if (req.status == 200) {
                            var tokenResponse = JSON.parse(req.responseText);
                            authSuccess(tokenResponse['access_token'], tokenResponse['refresh_token'], tokenResponse['id_token'], this.flow === 'standard');
                        } else {
                            this.onAuthError && this.onAuthError();
                            p_romise && p_romise.setError();
                        }
                    }
                };
                req.send(params);
            }
            function authSuccess(accessToken, refreshToken, idToken, fulfillP_romise) {
                timeLocal = (timeLocal + new Date().getTime()) / 2;
                setToken(accessToken, refreshToken, idToken, true);
                if (this.tokenParsed && this.tokenParsed.nonce != oauth.storedNonce || this.refreshTokenParsed && this.refreshTokenParsed.nonce != oauth.storedNonce || this.idTokenParsed && this.idTokenParsed.nonce != oauth.storedNonce) {
                    console.log('invalid nonce!');
                    this.clearToken();
                    p_romise && p_romise.setError();
                } else {
                    this.timeSkew = Math.floor(timeLocal / 1000) - this.tokenParsed.iat;
                    if (fulfillP_romise) {
                        this.onAuthSuccess && this.onAuthSuccess();
                        p_romise && p_romise.setSuccess();
                    }
                }
            }
        };

        AuthService.prototype.loadConfig = function loadConfig(url) {
            var p_romise = createP_romise();
            var configUrl;
            if (!config) {
                configUrl = 'keycloak.json';
            } else if (typeof config === 'string') {
                configUrl = config;
            }
            if (configUrl) {
                var req = new XMLHttpRequest();
                req.open('GET', configUrl, true);
                req.setRequestHeader('Accept', 'application/json');
                req.onreadystatechange = function () {
                    if (req.readyState == 4) {
                        if (req.status == 200) {
                            var config = JSON.parse(req.responseText);
                            this.authServerUrl = config['auth-server-url'];
                            this.realm = config['realm'];
                            this.clientId = config['resource'];
                            this.clientSecret = (config['credentials'] || {})['secret'];
                            p_romise.setSuccess();
                        } else {
                            p_romise.setError();
                        }
                    }
                };
                req.send();
            } else {
                if (!config['url']) {
                    var scripts = document.getElementsByTagName('script');
                    for (var i = 0; i < scripts.length; i++) {
                        if (scripts[i].src.match(/.*keycloak\.js/)) {
                            config.url = scripts[i].src.substr(0, scripts[i].src.indexOf('/js/keycloak.js'));
                            break;
                        }
                    }
                }
                if (!config.realm) {
                    throw 'realm missing';
                }
                if (!config.clientId) {
                    throw 'clientId missing';
                }
                this.authServerUrl = config.url;
                this.realm = config.realm;
                this.clientId = config.clientId;
                this.clientSecret = (config.credentials || {}).secret;
                p_romise.setSuccess();
            }
            return p_romise.p_romise;
        };

        AuthService.prototype.setToken = function setToken(token, refreshToken, idToken, useTokenTime) {
            if (this.tokenTimeoutHandle) {
                clearTimeout(this.tokenTimeoutHandle);
                this.tokenTimeoutHandle = null;
            }
            if (token) {
                this.token = token;
                this.tokenParsed = decodeToken(token);
                var sessionId = this.realm + '/' + this.tokenParsed.sub;
                if (this.tokenParsed.session_state) {
                    sessionId = sessionId + '/' + this.tokenParsed.session_state;
                }
                this.sessionId = sessionId;
                this.authenticated = true;
                this.subject = this.tokenParsed.sub;
                this.realmAccess = this.tokenParsed.realm_access;
                this.resourceAccess = this.tokenParsed.resource_access;
                if (this.onTokenExpired) {
                    var start = useTokenTime ? this.tokenParsed.iat : new Date().getTime() / 1000;
                    var expiresIn = this.tokenParsed.exp - start;
                    this.tokenTimeoutHandle = setTimeout(this.onTokenExpired, expiresIn * 1000);
                }
            } else {
                delete this.token;
                delete this.tokenParsed;
                delete this.subject;
                delete this.realmAccess;
                delete this.resourceAccess;
                this.authenticated = false;
            }
            if (refreshToken) {
                this.refreshToken = refreshToken;
                this.refreshTokenParsed = decodeToken(refreshToken);
            } else {
                delete this.refreshToken;
                delete this.refreshTokenParsed;
            }
            if (idToken) {
                this.idToken = idToken;
                this.idTokenParsed = decodeToken(idToken);
            } else {
                delete this.idToken;
                delete this.idTokenParsed;
            }
        };

        AuthService.prototype.decodeToken = function decodeToken(str) {
            str = str.split('.')[1];
            str = str.replace('/-/g', '+');
            str = str.replace('/_/g', '/');
            switch (str.length % 4) {
                case 0:
                    break;
                case 2:
                    str += '==';
                    break;
                case 3:
                    str += '=';
                    break;
                default:
                    throw 'Invalid token';
            }
            str = (str + '===').slice(0, str.length + str.length % 4);
            str = str.replace(/-/g, '+').replace(/_/g, '/');
            str = decodeURIComponent(escape(atob(str)));
            str = JSON.parse(str);
            return str;
        };

        AuthService.prototype.createUUID = function createUUID() {
            var s = [];
            var hexDigits = '0123456789abcdef';
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = '4';
            s[19] = hexDigits.substr(s[19] & 0x3 | 0x8, 1);
            s[8] = s[13] = s[18] = s[23] = '-';
            var uuid = s.join('');
            return uuid;
        };

        AuthService.prototype.createCallbackId = function createCallbackId() {
            var id = '<id: ' + this.callback_id++ + Math.random() + '>';
            return id;
        };

        AuthService.prototype.parseCallback = function parseCallback(url) {
            var oauth = new _CallbackParser.CallbackParser(url, this.responseMode).parseUri();
            var oauthState = storage.getItem('oauthState');
            var sessionState = oauthState && JSON.parse(oauthState);
            if (sessionState && (oauth.code || oauth.error || oauth.access_token || oauth.id_token) && oauth.state && oauth.state == sessionState.state) {
                storage.removeItem('oauthState');
                oauth.redirectUri = sessionState.redirectUri;
                oauth.storedNonce = sessionState.nonce;
                if (oauth.fragment) {
                    oauth.newUrl += '#' + oauth.fragment;
                }
                return oauth;
            }
        };

        AuthService.prototype.createP_romise = function createP_romise() {
            var p = {
                setSuccess: function setSuccess(result) {
                    p.success = true;
                    p.result = result;
                    if (p.successCallback) {
                        p.successCallback(result);
                    }
                },
                setError: function setError(result) {
                    p.error = true;
                    p.result = result;
                    if (p.errorCallback) {
                        p.errorCallback(result);
                    }
                },
                p_romise: {
                    success: function success(callback) {
                        if (p.success) {
                            callback(p.result);
                        } else if (!p.error) {
                            p.successCallback = callback;
                        }
                        return p.p_romise;
                    },
                    error: function error(callback) {
                        if (p.error) {
                            callback(p.result);
                        } else if (!p.success) {
                            p.errorCallback = callback;
                        }
                        return p.p_romise;
                    }
                }
            };
            return p;
        };

        AuthService.prototype.setupCheckLoginIframe = function setupCheckLoginIframe() {
            var p_romise = createP_romise();
            if (!loginIframe.enable) {
                p_romise.setSuccess();
                return p_romise.p_romise;
            }
            if (loginIframe.iframe) {
                p_romise.setSuccess();
                return p_romise.p_romise;
            }
            var iframe = document.createElement('iframe');
            loginIframe.iframe = iframe;
            iframe.onload = function () {
                var realmUrl = getRealmUrl();
                if (realmUrl.charAt(0) === '/') {
                    loginIframe.iframeOrigin = getOrigin();
                } else {
                    loginIframe.iframeOrigin = realmUrl.substring(0, realmUrl.indexOf('/', 8));
                }
                p_romise.setSuccess();
                setTimeout(check, loginIframe.interval * 1000);
            };
            var src = getRealmUrl() + '/protocol/openid-connect/login-status-iframe.html?client_id=' + encodeURIComponent(this.clientId) + '&origin=' + getOrigin();
            iframe.setAttribute('src', src);
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            var messageCallback = function messageCallback(event) {
                if (event.origin !== loginIframe.iframeOrigin) {
                    return;
                }
                var data = JSON.parse(event.data);
                var p_romise = loginIframe.callbackMap[data.callbackId];
                delete loginIframe.callbackMap[data.callbackId];
                if ((!this.sessionId || this.sessionId == data.session) && data.loggedIn) {
                    p_romise.setSuccess();
                } else {
                    this.clearToken();
                    p_romise.setError();
                }
            };
            window.addEventListener('message', messageCallback, false);
            var check = function check() {
                checkLoginIframe();
                if (this.token) {
                    setTimeout(check, loginIframe.interval * 1000);
                }
            };
            return p_romise.p_romise;
        };

        AuthService.prototype.checkLoginIframe = function checkLoginIframe() {
            var p_romise = createP_romise();
            if (loginIframe.iframe && loginIframe.iframeOrigin) {
                var msg = {};
                msg.callbackId = createCallbackId();
                loginIframe.callbackMap[msg.callbackId] = p_romise;
                var origin = loginIframe.iframeOrigin;
                loginIframe.iframe.contentWindow.postMessage(JSON.stringify(msg), origin);
            } else {
                p_romise.setSuccess();
            }
            return p_romise.p_romise;
        };

        AuthService.prototype.loadAdapter = function loadAdapter(type) {
            if (!type || type == 'default') {
                return {
                    login: function login(options) {
                        window.location.href = this.createLoginUrl(options);
                        return createP_romise().p_romise;
                    },
                    logout: function logout(options) {
                        window.location.href = this.createLogoutUrl(options);
                        return createP_romise().p_romise;
                    },
                    register: function register(options) {
                        window.location.href = this.createRegisterUrl(options);
                        return createP_romise().p_romise;
                    },
                    accountManagement: function accountManagement() {
                        window.location.href = this.createAccountUrl();
                        return createP_romise().p_romise;
                    },
                    redirectUri: function redirectUri(options, encodeHash) {
                        if (arguments.length == 1) {
                            encodeHash = true;
                        }
                        if (options && options.redirectUri) {
                            return options.redirectUri;
                        } else if (this.redirectUri) {
                            return this.redirectUri;
                        } else {
                            var redirectUri = location.href;
                            if (location.hash && encodeHash) {
                                redirectUri = redirectUri.substring(0, location.href.indexOf('#'));
                                redirectUri += (redirectUri.indexOf('?') == -1 ? '?' : '&') + 'redirect_fragment=' + encodeURIComponent(location.hash.substring(1));
                            }
                            return redirectUri;
                        }
                    }
                };
            }
            if (type == 'cordova') {
                loginIframe.enable = false;
                return {
                    login: function login(options) {
                        var p_romise = createP_romise();
                        var o = 'location=no';
                        if (options && options.prompt == 'none') {
                            o += ',hidden=yes';
                        }
                        var loginUrl = this.createLoginUrl(options);
                        var ref = window.open(loginUrl, '_blank', o);
                        var completed = false;
                        ref.addEventListener('loadstart', function (event) {
                            if (event.url.indexOf('http://localhost') == 0) {
                                var callback = parseCallback(event.url);
                                processCallback(callback, p_romise);
                                ref.close();
                                completed = true;
                            }
                        });
                        ref.addEventListener('loaderror', function (event) {
                            if (!completed) {
                                if (event.url.indexOf('http://localhost') == 0) {
                                    var callback = parseCallback(event.url);
                                    processCallback(callback, p_romise);
                                    ref.close();
                                    completed = true;
                                } else {
                                    p_romise.setError();
                                    ref.close();
                                }
                            }
                        });
                        return p_romise.p_romise;
                    },
                    logout: function logout(options) {
                        var p_romise = createP_romise();
                        var logoutUrl = this.createLogoutUrl(options);
                        var ref = window.open(logoutUrl, '_blank', 'location=no,hidden=yes');
                        var error;
                        ref.addEventListener('loadstart', function (event) {
                            if (event.url.indexOf('http://localhost') == 0) {
                                ref.close();
                            }
                        });
                        ref.addEventListener('loaderror', function (event) {
                            if (event.url.indexOf('http://localhost') == 0) {
                                ref.close();
                            } else {
                                error = true;
                                ref.close();
                            }
                        });
                        ref.addEventListener('exit', function (event) {
                            if (error) {
                                p_romise.setError();
                            } else {
                                this.clearToken();
                                p_romise.setSuccess();
                            }
                        });
                        return p_romise.p_romise;
                    },
                    register: function register() {
                        var registerUrl = this.createRegisterUrl();
                        var ref = window.open(registerUrl, '_blank', 'location=no');
                        ref.addEventListener('loadstart', function (event) {
                            if (event.url.indexOf('http://localhost') == 0) {
                                ref.close();
                            }
                        });
                    },
                    accountManagement: function accountManagement() {
                        var accountUrl = this.createAccountUrl();
                        var ref = window.open(accountUrl, '_blank', 'location=no');
                        ref.addEventListener('loadstart', function (event) {
                            if (event.url.indexOf('http://localhost') == 0) {
                                ref.close();
                            }
                        });
                    },
                    redirectUri: function redirectUri(options) {
                        return 'http://localhost';
                    }
                };
            }
            throw 'invalid adapter type: ' + type;
        };

        return AuthService;
    }();
});