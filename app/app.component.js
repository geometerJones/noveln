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
var router_deprecated_1 = require('@angular/router-deprecated');
var auth_service_1 = require('./auth.service');
var notation_service_1 = require('./notation.service');
var home_component_1 = require('./home.component');
var login_component_1 = require('./login.component');
var register_component_1 = require('./register.component');
var notation_component_1 = require('./notation.component');
var note_stream_component_1 = require('./note-stream.component');
var note_detail_component_1 = require('./note-detail.component');
require('./rxjs-operators');
var AppComponent = (function () {
    function AppComponent(router, authService) {
        this.router = router;
        this.authService = authService;
        this.title = 'noveln';
        this.taglines = [
            'the n stands for notation',
            'present your reasoning',
            'let every note build opon the others',
            'outline everything. what exactly is an outline?'
        ];
        this.loggedIn = false;
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.authService.getAuth()) {
            this.loggedIn = true;
        }
        this.authService.loginSuccess.subscribe(// subscribe to future logins
        function (auth) {
            _this.loggedIn = true;
            //this.profile = auth.profile; 
            _this.router.navigate(['Notation']);
        }, function (error) {
            console.log(error);
        });
        console.log('logged in', this.loggedIn);
    };
    AppComponent.prototype.logout = function () {
        this.loggedIn = false;
        this.authService.logout();
        this.router.navigate(['Home']);
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            template: "\n    <div id=\"site-header\">\n      <div class=\"header-logo\">&nbsp;novel<span class=\"n\">n</span>&nbsp;</div>\n      <div *ngIf=\"!loggedIn\" class=\"header-content\">\n        <a [routerLink]=\"['Home']\">home</a>\n        <a [routerLink]=\"['Login']\">login</a>\n        <a [routerLink]=\"['Register']\">register</a>\n      </div>\n      <div *ngIf=\"loggedIn\" class=\"header-content\">\n        <a [routerLink]=\"['Home']\">home</a>\n        <a [routerLink]=\"['Notation']\">notation</a>\n        <a [routerLink]=\"['Notestream']\">notestream</a>\n        <a [routerLink]=\"['Home']\" (click)=\"logout()\">logout</a>\n      </div>\n      <div class=\"clear\"></div>\n    </div>\n    <div id=\"site-content\">\n      <router-outlet></router-outlet>\n    </div>\n  ",
            styles: ["\n  "],
            directives: [
                //COMMON_DIRECTIVES,
                router_deprecated_1.ROUTER_DIRECTIVES
            ],
            providers: [
                auth_service_1.AuthService,
                notation_service_1.NotationService
            ]
        }),
        router_deprecated_1.RouteConfig([
            { path: '/', name: 'Home', component: home_component_1.HomeComponent, useAsDefault: true },
            { path: '/login', name: 'Login', component: login_component_1.LoginComponent },
            { path: '/register', name: 'Register', component: register_component_1.RegisterComponent },
            { path: '/notation', name: 'Notation', component: notation_component_1.NotationComponent },
            { path: '/notestream', name: 'Notestream', component: note_stream_component_1.NoteStreamComponent },
            { path: '/detail/:id', name: 'NoteDetail', component: note_detail_component_1.NoteDetailComponent },
        ]), 
        __metadata('design:paramtypes', [router_deprecated_1.Router, auth_service_1.AuthService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
;
//# sourceMappingURL=app.component.js.map