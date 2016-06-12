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
var auth_service_1 = require('./auth.service');
var LoginComponent = (function () {
    function LoginComponent(authService) {
        this.authService = authService;
    }
    LoginComponent.prototype.login = function () {
        var _this = this;
        this.error = null;
        this.authService.login(this.username, this.password).subscribe(function (auth) {
            if (!auth || !auth.token || !auth.user) {
                _this.error = 'auth failed...?';
                console.error(auth);
            }
        }, function (error) {
            _this.error = error;
        });
    };
    LoginComponent = __decorate([
        core_1.Component({
            selector: 'my-login',
            template: "\n    <input [(ngModel)]=\"username\" type=\"text\" placeholder=\"username\" />\n    <input [(ngModel)]=\"password\" type=\"password\" placeholder=\"password\" />\n    <button (click)=\"login()\" >Login</button>\n    <div *ngIf=\"error\" class=\"error\">{{error}}</div>\n  "
        }), 
        __metadata('design:paramtypes', [auth_service_1.AuthService])
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=login.component.js.map