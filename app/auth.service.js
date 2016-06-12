"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var Observable_1 = require('rxjs/Observable');
var AuthService = (function () {
    function AuthService(http) {
        var _this = this;
        this.http = http;
        this.registerUrl = 'api/register';
        this.loginUrl = 'api/login';
        this.loginSuccess = new Observable_1.Observable(function (observer) {
            _this.loginSuccessObserver = observer;
        }).share(); // is there a more direct way to output to app?
    }
    AuthService.prototype.handleError = function (error) {
        var errMsg = (error.json().message) ? error.json().message :
            error.status ? error.status + " - " + error.statusText : 'Server error';
        return Observable_1.Observable.throw(errMsg);
    };
    AuthService.prototype.register = function (username, password) {
        var _this = this;
        var body = JSON.stringify({ username: username, password: password });
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        return this.http.post(this.registerUrl, body, { headers: headers })
            .map(function (res) {
            var data = res.json();
            console.log(data);
            if (data.token && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                _this.loginSuccessObserver.next(data);
            }
            return data;
        })
            .catch(this.handleError);
    };
    AuthService.prototype.login = function (username, password) {
        var _this = this;
        var body = JSON.stringify({ username: username, password: password });
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        return this.http.post(this.loginUrl, body, { headers: headers })
            .map(function (response) {
            var data = response.json();
            console.log(data);
            if (data.token && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                _this.loginSuccessObserver.next(data);
            }
            return data;
        })
            .catch(this.handleError);
    };
    AuthService.prototype.logout = function () {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // http request to nofify server of logout details?
    };
    AuthService.prototype.getToken = function () {
        return localStorage.getItem('token');
    };
    AuthService.prototype.getUser = function () {
        var user = localStorage.getItem('user');
        if (user)
            return JSON.parse(user);
    };
    AuthService.prototype.getAuth = function () {
        var token = localStorage.getItem('token');
        var user = localStorage.getItem('user');
        if (token && user) {
            return {
                'token': token,
                'user': JSON.parse(user)
            };
        }
        return null;
    };
    AuthService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], AuthService);
    return AuthService;
}());
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map