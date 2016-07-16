'use strict';



var PersistentStorage = function () {
    function PersistentStorage() {
        
    }

    PersistentStorage.prototype.useCookieStorage = function useCookieStorage() {
        if (typeof localStorage === "undefined") {
            return true;
        }
        try {
            key = '@@keycloak-session-storage/test';
            localStorage.setItem(key, 'test');
            localStorage.removeItem(key);
            return false;
        } catch (err) {
            return true;
        }
    };

    PersistentStorage.prototype.setitem = function setitem(key, value) {
        if (useCookieStorage()) {
            setCookie(key, value, cookieExpiration(5));
        } else {
            localStorage.setItem(key, value);
        }
    };

    PersistentStorage.prototype.getItem = function getItem(key) {
        if (useCookieStorage()) {
            return getCookie(key);
        }
        return localStorage.getItem(key);
    };

    PersistentStorage.prototype.removeItem = function removeItem(key) {
        if (typeof localStorage !== "undefined") {
            try {
                localStorage.removeItem(key);
            } catch (err) {}
        }

        setCookie(key, '', cookieExpiration(-100));
    };

    PersistentStorage.prototype.cookieExpiration = function cookieExpiration(minutes) {
        exp = new Date();
        exp.setTime(exp.getTime() + minutes * 60 * 1000);
        return exp;
    };

    PersistentStorage.prototype.getCookie = function getCookie(key) {
        name = key + '=';
        ca = document.cookie.split(';');
        for (i = 0; i < ca.length; i++) {
            c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    };

    PersistentStorage.prototype.setCookie = function setCookie(key, value, expirationDate) {
        cookie = key + '=' + value + '; ' + 'expires=' + expirationDate.toUTCString() + '; ';
        document.cookie = cookie;
    };

    return PersistentStorage;
}();

;