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
//import { UserService } from './user.service';
var auth_service_1 = require('./auth.service');
var NotationService = (function () {
    function NotationService(http, authService) {
        this.http = http;
        this.authService = authService;
        this.notationUrl = 'api/notation'; // used to get notes and edges
        this.noteUrl = '/api/note'; // used to post/put/delete notes
        this.relationUrl = '/api/relation'; // used to post/put/delete relations
    }
    NotationService.prototype.handleError = function (error) {
        var errMsg = (error.json().message) ? error.json().message :
            error.status ? error.status + " - " + error.statusText : 'Server error';
        console.error(errMsg);
        return Observable_1.Observable.throw(errMsg);
    };
    NotationService.prototype.headers = function () {
        var headers = new http_1.Headers({
            'Content-Type': 'application/json',
            'token': this.authService.getToken()
        });
        return headers;
    };
    NotationService.prototype.getNotation = function () {
        var headers = this.headers();
        return this.http.get(this.notationUrl, { headers: headers })
            .map(function (res) {
            console.log(res);
            return res.json();
        })
            .catch(this.handleError);
    };
    NotationService.prototype.saveNote = function (note) {
        if (note.id) {
            return this.putNote(note);
        }
        else {
            return this.postNote(note);
        }
    };
    NotationService.prototype.postNote = function (note) {
        var body = JSON.stringify(note);
        var headers = this.headers();
        return this.http.post(this.noteUrl, body, { headers: headers })
            .map(function (res) {
            console.log(res);
            return res.json();
        })
            .catch(this.handleError);
    };
    NotationService.prototype.putNote = function (note) {
        var url = this.noteUrl + "/" + note.id;
        var body = JSON.stringify(note);
        var headers = this.headers();
        return this.http.put(url, body, { headers: headers })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    NotationService.prototype.deleteNote = function (note) {
        var url = this.noteUrl + "/" + note.id;
        var headers = this.headers();
        return this.http.delete(url, headers)
            .map(function (res) {
            console.log(res);
            return res.json();
        })
            .catch(this.handleError);
    };
    NotationService.prototype.saveRelation = function (relation) {
        if (relation.id) {
            return this.putRelation(relation);
        }
        else {
            this.postRelation(relation);
        }
    };
    NotationService.prototype.postRelation = function (relation) {
        var body = JSON.stringify(relation);
        var headers = this.headers();
        return this.http.post(this.relationUrl, body, { headers: headers })
            .map(function (res) {
            console.log(res);
            return res.json();
        })
            .catch(this.handleError);
    };
    NotationService.prototype.putRelation = function (relation) {
        var url = this.relationUrl + "/" + relation.id;
        var body = JSON.stringify(relation);
        var headers = this.headers();
        return this.http.put(url, body, { headers: headers })
            .map(function (res) {
            console.log(res);
            return res.json();
        })
            .catch(this.handleError);
    };
    NotationService.prototype.deleteRelation = function (relation) {
        var url = this.relationUrl + "/" + relation.id;
        var headers = this.headers();
        return this.http.delete(url, headers)
            .map(function (res) {
            console.log(res);
            return res.json();
        })
            .catch(this.handleError);
    };
    NotationService.prototype.clone = function (obj) {
        var copy;
        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj)
            return obj;
        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = this.clone(obj[i]);
            }
            return copy;
        }
        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr))
                    copy[attr] = this.clone(obj[attr]);
            }
            return copy;
        }
        throw new Error("Unable to copy obj! Its type isn't supported.");
    };
    NotationService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http, auth_service_1.AuthService])
    ], NotationService);
    return NotationService;
}());
exports.NotationService = NotationService;
//# sourceMappingURL=notation.service.js.map