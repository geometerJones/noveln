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
var note_1 = require('./models/note');
var notation_service_1 = require('./notation.service');
var autosize_directive_1 = require('./autosize.directive');
// TODO use ng-pristine, ng-dirty instead of classes?
var NoteDetailComponent = (function () {
    function NoteDetailComponent(routeParams, notationService) {
        this.routeParams = routeParams;
        this.notationService = notationService;
        this.edgingSource = new core_1.EventEmitter();
        this.edgingTarget = new core_1.EventEmitter();
        this.detailed = false;
        this.dirtied = false;
    }
    NoteDetailComponent.prototype.ngOnInit = function () {
        console.log(this.note);
        this.pristineNote = this.notationService.clone(this.note);
        /*
            var element = document.getElementById('note-'+this.note.id);
            new ResizeSensor(element, function() {
                console.log('resize', element);
            });
            if (this.note.width) {
            }*/
    };
    NoteDetailComponent.prototype.showControls = function () {
        var note = document.getElementById('note-' + this.note.id);
        note.getElementsByClassName('controls').item(0).classList.remove('hidden');
    };
    NoteDetailComponent.prototype.hideControls = function () {
        var note = document.getElementById('note-' + this.note.id);
        note.getElementsByClassName('controls').item(0).classList.add('hidden');
    };
    NoteDetailComponent.prototype.toggleFlag = function () {
        this.note.flagged = !this.note.flagged;
        this.dirtied = true;
    };
    NoteDetailComponent.prototype.toggleDetail = function () {
        this.detailed = !this.detailed;
    };
    NoteDetailComponent.prototype.dirty = function () {
        this.dirtied = true;
    };
    NoteDetailComponent.prototype.mouseup = function (event) {
        console.log('mouseup', event);
    };
    NoteDetailComponent.prototype.onResize = function (event) {
        console.log('resize', event); //TODO record resize
    };
    NoteDetailComponent.prototype.startEdge = function () {
        this.edgingSource.emit(this.note);
    };
    NoteDetailComponent.prototype.finishEdge = function () {
        this.edgingTarget.emit(this.note);
    };
    NoteDetailComponent.prototype.save = function () {
        var _this = this;
        if (this.note.id) {
            var snapshot = this.notationService.clone(this.note);
        }
        //this.note.height = 100;
        //this.note.width = 12;
        this.notationService.saveNote(this.note).subscribe(function (result) {
            console.log(result);
            if (_this.note.id) {
                _this.pristineNote = snapshot; //PUT
            }
            else {
                // right now we dont keep the note, we wipe it to reuse this as a new note form
                _this.refresh(); //POST
            }
            _this.dirtied = false;
        });
    };
    NoteDetailComponent.prototype.refresh = function () {
        // return to original size
        this.note = this.notationService.clone(this.pristineNote);
        this.dirtied = false;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', note_1.Note)
    ], NoteDetailComponent.prototype, "note", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], NoteDetailComponent.prototype, "edgingSource", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], NoteDetailComponent.prototype, "edgingTarget", void 0);
    NoteDetailComponent = __decorate([
        core_1.Component({
            selector: 'my-note-detail',
            template: "\n    <div id=\"note-{{note.id}}\" class=\"note\"\n      [class.dirty]=\"dirtied\"\n      [class.flagged]=\"note.flagged\"\n      (mouseenter)=\"showControls()\"\n      (mouseleave)=\"hideControls()\"\n      (resize)=\"onResize(event)\">\n      <div class=\"surface\">\n        <textarea autosize \n          [(ngModel)]=\"note.text\"\n          (keyup)=\"dirty()\" placeholder=\"text\" cols=\"40\">\n          (mouseup)=\"mouseup(event)\"\n          (resize)=\"onResize(event)\"\n        </textarea>\n      </div>\n      <div class=\"controls hidden\">\n        <button (click)=\"startEdge()\">start-bond</button>\n        <button (click)=\"finishEdge()\">finish-bond</button>\n        \n        <button (click)=\"toggleFlag()\">Flag</button>\n        <button (click)=\"toggleDetail()\">Detail</button>\n        <button [hidden]=\"!dirtied\" (click)=\"save()\">Save</button>\n        <button [hidden]=\"!dirtied\" (click)=\"refresh()\">Refresh</button>\n      </div>\n      <div class=\"detail\" [hidden]=\"!detailed\">\n        <div class=\"table\">\n          <div class=\"row\">\n            <div class=\"cell left\">id:</div>\n            <div class=\"cell right\">{{note.id}}</div>\n          </div>\n          <div class=\"row\">\n            <div class=\"cell left\">presented:</div>\n            <div class=\"cell right\">{{note.presented}}</div>\n          </div>\n          <div class=\"row\">\n            <div class=\"cell left\">presentedby:</div>\n            <div class=\"cell right\">{{note.presentedby}}</div>\n          </div>\n          <div class=\"row\">\n            <div class=\"cell left\">lastmodified:</div>\n            <div class=\"cell right\">{{note.lastmodified}}</div>\n          </div>\n          <div class=\"row\">\n            <div class=\"cell left\">lastmodifiedby:</div>\n            <div class=\"cell right\">{{note.lastmodifiedby}}</div>\n          </div>\n          <div class=\"row\">\n            <div class=\"cell left\">x:</div>\n            <div class=\"cell right\">\n              <input class=\"detail-input\"[(ngModel)]=\"note.user_x\" (keyup)=\"dirty()\"/>\n            </div>\n          </div>\n          <div class=\"row\">\n            <div class=\"cell left\">y:</div>\n            <div class=\"cell right\">\n              <input class=\"detail-input\"[(ngModel)]=\"note.user_y\" (keyup)=\"dirty()\"/>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  ",
            styles: ["\n    .note {\n      margin:8px;\n      padding: 2px;\n      border: 1px solid lavender;\n      border-radius: 5px;\n      position: relative;\n      cursor: grab;\n      background-color: white;\n      display: block;\n    }\n    .edging {\n      background-color: steelblue;\n    }\n    .dirty {\n      border: 2px solid red;\n    }\n    .flagged {\n      border: 2px solid darkturquoise;\n    }\n    .note-text {\n      max-height: 200px;\n    }\n    .detail {\n      border: 1px solid lavender;\n      font-size: small;\n    }\n    .table {\n      display: table;\n      width: 100%;\n    }\n    .row {\n      display: table-row;\n    }\n    .cell {\n      display: table-cell;\n      padding: 1px;\n    }\n    .left {\n      text-align: right;\n      padding-right: 2px;\n    }\n    .right {\n      text-align: left;\n      padding-right: 2px;\n    }\n    .hidden {\n      display: none;\n    }\n    .detail-input {\n      width: 100%;\n    }\n  "],
            directives: [autosize_directive_1.Autosize]
        }), 
        __metadata('design:paramtypes', [router_deprecated_1.RouteParams, notation_service_1.NotationService])
    ], NoteDetailComponent);
    return NoteDetailComponent;
}());
exports.NoteDetailComponent = NoteDetailComponent;
//# sourceMappingURL=note-detail.component.js.map