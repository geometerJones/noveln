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
var notation_service_1 = require('./notation.service');
var note_detail_component_1 = require('./note-detail.component');
var NoteStreamComponent = (function () {
    // how do i apply a class to the s
    function NoteStreamComponent(notationService) {
        this.notationService = notationService;
        this.notes = [];
    }
    NoteStreamComponent.prototype.ngOnInit = function () {
        this.getNotes();
    };
    NoteStreamComponent.prototype.getNotes = function () {
        var _this = this;
        this.notationService.getNotation()
            .subscribe(function (units) {
            units.forEach(function (unit) {
                _this.notes.push(unit.n);
            });
            _this.scrollRight();
        }, function (error) {
            console.error(error);
        });
    };
    NoteStreamComponent.prototype.scrollRight = function () {
        var channel = document.getElementsByClassName("channel").item(0);
        setTimeout(function () {
            channel.scrollLeft = channel.scrollWidth - channel.clientWidth;
        }, 0);
    };
    NoteStreamComponent = __decorate([
        core_1.Component({
            selector: 'my-notes',
            template: "\n    <div class=\"channel\">\n      <div class=\"stream\">\n        <div *ngFor=\"let note of notes\" class=\"slice\">\n          <my-note-detail [note]=\"note\"></my-note-detail>\n        </div>\n      </div>\n    </div>\n  ",
            styles: ["\n    .channel {\n      width: 100%;\n      // TODO: adjust to match window height;\n      overflow-x: scroll;\n      border: 1px solid lavender;\n    }\n    .stream {\n      //display: table-row;\n    }\n    .slice {\n      display: inline-block; //table-cell;\n    }\n  "],
            directives: [
                note_detail_component_1.NoteDetailComponent
            ],
        }), 
        __metadata('design:paramtypes', [notation_service_1.NotationService])
    ], NoteStreamComponent);
    return NoteStreamComponent;
}());
exports.NoteStreamComponent = NoteStreamComponent;
;
//# sourceMappingURL=note-stream.component.js.map