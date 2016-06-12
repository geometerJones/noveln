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
var note_1 = require('./models/note');
var auth_service_1 = require('./auth.service');
var notation_service_1 = require('./notation.service');
var note_stream_component_1 = require('./note-stream.component');
var note_detail_component_1 = require('./note-detail.component');
// <line *ngFor="let link of links" class='link'></line>
var NotationComponent = (function () {
    function NotationComponent(authService, notationService) {
        this.authService = authService;
        this.notationService = notationService;
        this.notes = [];
        this.nodes = [];
        this.relations = [];
        this.notes_by_id = {};
        this.presenting = null;
        this.edging_note = null; // the note with a pending edge making
        this.handleZ = 100000; // eventually a box click will cover an untouched node...
        this.boxZ = 0;
        this.loaded = false;
        this.width = 10000;
        this.height = 10000;
        this.gravity = 0.15;
        this.friction = .8;
        this.linkDistance = 220;
        this.linkStrength = 0.4;
        this.charge = -7000;
        this.theta = 0.8;
        this.alpha = 0.1;
        this.counter = 0;
    }
    // add user to view; make it toggleable
    // drag note into other note
    // draw edges with arrows
    NotationComponent.prototype.ngOnInit = function () {
        this.spaceOut();
        this.loadUser();
        this.getNotation();
    };
    NotationComponent.prototype.ngAfterViewChecked = function () {
        var _this = this;
        if (this.notes && this.force && !this.loaded) {
            // runs once, after note components are loaded
            // load notes into boxes w/ handles
            this.loaded = true;
            this.notes.forEach(function (note) {
                _this.loadNote(note);
            });
            this.boxes = d3.selectAll('.box');
            this.handles = d3.selectAll('.handle');
        }
        if (this.presenting) {
            var note = this.presenting;
            this.presenting = null;
            this.loadNote(note);
            this.boxes = d3.selectAll('.box');
            this.handles = d3.selectAll('.handle');
            console.log('boxes', this.boxes);
            console.log('handles', this.handles);
            this.startForce();
        }
    };
    NotationComponent.prototype.spaceOut = function () {
        var _this = this;
        // resize
        var space = d3.select('.space')
            .attr('width', this.width)
            .attr('height', this.height);
        var svg = space.select('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .on('dblclick', function () {
            if (d3.event.shiftKey) {
                _this.presentBand(d3.event);
            }
            else {
                _this.presentNote(d3.event);
            }
        });
        // draw coordinates
        this.origin = { x: this.width / 2, y: this.height / 2 };
        var interval = 200;
        var _loop_1 = function(i) {
            [-1, 1].forEach(function (direction) {
                var y = _this.origin.y + direction * i;
                svg.append('line') // horizontals
                    .attr('class', 'axis')
                    .attr('x1', 0)
                    .attr('y1', y)
                    .attr('x2', _this.width)
                    .attr('y2', y)
                    .attr('stroke', function (d) {
                    if (i == 0) {
                        return 'steelblue';
                    }
                    return 'lavender';
                })
                    .attr('stroke-width', function (d) {
                    if (i == 0) {
                        return 2;
                    }
                    return 1;
                });
                var x = _this.origin.x + direction * i;
                svg.append('line') // verticals
                    .attr('class', 'axis')
                    .attr('x1', x)
                    .attr('y1', 0)
                    .attr('x2', x)
                    .attr('y2', _this.height)
                    .attr('stroke', function (d) {
                    if (i == 0) {
                        return 'steelblue';
                    }
                    return 'lavender';
                })
                    .attr('stroke-width', function (d) {
                    if (i == 0) {
                        return 2;
                    }
                    return 1;
                });
            });
        };
        for (var i = 0; i < this.height / 2; i += interval) {
            _loop_1(i);
        }
        // center view
        var header = document.getElementById('site-header');
        var x = this.origin.x - window.innerWidth / 2;
        var y = this.origin.y - window.innerHeight / 2 + header.offsetHeight + 25;
        window.scroll(x, y);
    };
    NotationComponent.prototype.userX = function (viewX) {
        return viewX - this.origin.x;
    };
    NotationComponent.prototype.userY = function (viewY) {
        return this.origin.y - viewY;
    };
    NotationComponent.prototype.viewX = function (userX) {
        return userX + this.origin.x;
    };
    NotationComponent.prototype.viewY = function (userY) {
        return this.origin.y - userY;
    };
    NotationComponent.prototype.loadUser = function () {
        this.user = this.authService.getUser();
        this.user.x = this.origin.x;
        this.user.y = this.origin.y;
        this.user.fixed = true;
        var userbox = d3.select('.user-box');
        console.log(userbox);
        userbox
            .data([this.user])
            .style('left', function (d) {
            console.log('offwi', this.offsetWidth);
            return d.x - this.offsetWidth / 2 + '';
        })
            .style('top', function (d) {
            console.log('offhe', this.offsetHeight);
            return d.y - this.offsetHeight / 2 + '';
        });
        console.log('user', this.user);
        console.log('userbox', userbox);
        this.nodes.push(this.user);
    };
    NotationComponent.prototype.getNotation = function () {
        var _this = this;
        this.notationService.getNotation()
            .subscribe(function (notation) {
            console.log('notation', notation);
            if (notation) {
                notation.forEach(function (unit) {
                    unit.note.x = _this.viewX(unit.note.user_x);
                    unit.note.y = _this.viewY(unit.note.user_y);
                    _this.notes.push(unit.note);
                    _this.nodes.push(unit.note);
                    _this.relations.push.apply(unit.out_relations);
                    _this.notes_by_id[unit.note.id] = unit.note; // map needed to get links
                });
                console.log('notes', _this.notes);
                _this.loadRelations();
                _this.initForce();
                _this.startForce();
            }
        }, function (error) { console.error('error', error); });
    };
    NotationComponent.prototype.loadNote = function (note) {
        var _this = this;
        var space = d3.select('.space');
        space.select('#box-' + note.id)
            .data([note])
            .on('click', function (d) {
            _this.boxZ++;
            document.getElementById('box-' + d.id).style.zIndex = _this.boxZ + '';
            _this.handleZ++;
            document.getElementById('handle-' + d.id).style.zIndex = _this.handleZ + '';
        });
        space.select('#handle-' + note.id)
            .data([note])
            .classed('fixed', function (d) { return d.fixed; })
            .on('click', function (d) {
            _this.handleZ++;
            document.getElementById('handle-' + d.id).style.zIndex = _this.handleZ + '';
            _this.boxZ++;
            document.getElementById('box-' + d.id).style.zIndex = _this.boxZ + '';
        })
            .on('dblclick', function (d) {
            d.fixed = false;
            document.getElementById('handle-' + d.id).classList.remove('fixed');
        })
            .call(this.force.drag().on("dragstart", function (d) {
            d.fixed = true;
            document.getElementById('handle-' + d.id).classList.add('fixed');
        }));
    };
    NotationComponent.prototype.loadRelations = function () {
        var _this = this;
        this.relations.forEach(function (relation, i, array) {
            relation.source = _this.notes_by_id[relation.sourceid];
            relation.target = _this.notes_by_id[relation.targetid];
            array[i] = relation;
        });
        console.log('relations', this.relations);
        this.links = d3.select('svg').selectAll('.link')
            .data(this.relations) // make these paths with arrows
            .enter().append('line')
            .attr('class', 'link')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2);
        //.exit().remove();
        console.log('links', this.links);
    };
    NotationComponent.prototype.initForce = function () {
        var _this = this;
        this.force = d3.layout.force()
            .size([this.width, this.height])
            .nodes(this.nodes)
            .links(this.relations)
            .gravity(this.gravity)
            .friction(this.friction)
            .linkDistance(function (d) {
            // get the length of the diagonal?
            var distance = _this.linkDistance;
            return distance;
        })
            .linkStrength(function (d) {
            // operate on link type
            var strength = _this.linkStrength;
            return strength;
        })
            .charge(function (d) {
            // vary by note size, we
            var charge = _this.charge;
            return charge;
        })
            .theta(this.theta)
            .on('tick', function () {
            console.log('tick');
            if (_this.links) {
                _this.links //.transition().ease('linear').duration(this.animationStep)
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });
            }
            if (_this.boxes) {
                _this.boxes
                    .style('left', function (d) {
                    return d.x - this.offsetWidth / 2 + '';
                })
                    .style('top', function (d) {
                    return d.y - this.offsetHeight / 2 + '';
                });
            }
            if (_this.handles) {
                _this.handles
                    .style('left', function (d) {
                    var box = document.getElementById('box-' + d.id);
                    return d.x - box.offsetWidth / 2 - 5 + '';
                })
                    .style('top', function (d) {
                    var box = document.getElementById('box-' + d.id);
                    return d.y - box.offsetHeight / 2 - 5 + '';
                });
            }
            _this.notes.forEach(function (note) {
                note.user_x = _this.userX(note.x);
                note.user_y = _this.userY(note.y);
            });
        });
        console.log('force', this.force);
    };
    NotationComponent.prototype.startForce = function () {
        this.force.start();
    };
    NotationComponent.prototype.stopForce = function () {
        this.force.stop();
    };
    NotationComponent.prototype.presentNote = function (event) {
        var _this = this;
        console.log(event);
        var markid = 'mark-' + this.counter;
        this.counter++;
        d3.select('svg').append('circle')
            .attr('id', markid)
            .attr('r', 5)
            .attr('cx', event.offsetX)
            .attr('cy', event.offsetY)
            .attr('fill', 'azure')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1);
        var note = new note_1.Note();
        note.x = event.offsetX;
        note.y = event.offsetY;
        note.user_x = this.userX(note.x);
        note.user_y = this.userY(note.y);
        this.notationService.saveNote(note).subscribe(function (note) {
            console.log('posted!', note);
            _this.notes.push(note);
            _this.notes_by_id[note.id] = note;
            _this.presenting = note;
            d3.select('#' + markid).remove();
        }, function (error) { console.error(error); });
    };
    NotationComponent.prototype.presentBand = function (event) {
        console.error('not yet implemented');
    };
    NotationComponent = __decorate([
        core_1.Component({
            selector: 'my-notation',
            template: "\n    <div>{{user.username}}'s notation</div>\n\n    <button (click)=\"startForce()\">play</button>\n    <button (click)=\"stopForce()\">stop</button>\n    <input [(ngModel)]=\"width\" placeholder=\"width\"/>\n    <input [(ngModel)]=\"height\" placeholder=\"height\"/>\n\n    <div class='space'>\n      <svg>\n      </svg>\n\n      <div id='box-{{user.id}}' class='user-box'>\n        {{user.username}}\n        {{user.text}}\n      </div>\n\n      <div *ngFor=\"let note of notes\" id=\"box-{{note.id}}\" class='box'>\n        <my-note-detail [note]=\"note\"> </my-note-detail>\n      </div>\n      <div *ngFor=\"let note of notes\" id=\"handle-{{note.id}}\" class='handle'></div>\n\n    </div>\n  ",
            styles: ["\n    .space {\n      position: relative;\n      //border: 1px solid lavender;\n    }\n    svg {\n      border: 1px solid lavender;\n    }\n    .handle {\n      position: absolute;\n      z-index: 100000;\n      width: 20px;\n      height: 20px;\n      opacity: .8;\n      background-color: azure;\n      border-radius: 4px;\n      border: 1px solid steelblue;\n    }\n    .handle.fixed {\n      background-color: lavender;\n    }\n    .handle:hover {\n      cursor: pointer;\n    }\n    .box {\n      position: absolute;\n      z-index: 0;\n      opacity: .85;\n      border-radius: 4px;\n      border: 1px solid steelblue;\n    }\n    .box:hover {\n      background-color: azure;\n    }\n    .user-box {\n      position: absolute;\n      z-index: 100000;\n      opacity: .85;\n      padding: 5px;\n      border-radius: 4px;\n      border: 1px solid steelblue;\n      width: 270px;\n      height: 180px;\n      background-color: white;\n    }\n  "],
            directives: [
                note_stream_component_1.NoteStreamComponent,
                note_detail_component_1.NoteDetailComponent
            ]
        }), 
        __metadata('design:paramtypes', [auth_service_1.AuthService, notation_service_1.NotationService])
    ], NotationComponent);
    return NotationComponent;
}());
exports.NotationComponent = NotationComponent;
//# sourceMappingURL=notation.component.js.map