import { Component, Input, OnInit, AfterViewChecked} from '@angular/core';
import { Router, RouteParams } from '@angular/router-deprecated';

import { User } from './models/user';
import { Note } from './models/note';
import { Relation } from './models/relation';

import { AuthService } from './auth.service';
import { NotationService } from './notation.service';

import { NoteStreamComponent } from './note-stream.component';
import { NoteDetailComponent } from './note-detail.component';

declare var d3;

// <line *ngFor="let link of links" class='link'></line>
@Component({
  selector: 'my-notation',
  template: `
    <div>{{user.username}}'s notation</div>

    <button (click)="startForce()">play</button>
    <button (click)="stopForce()">stop</button>
    <input [(ngModel)]="width" placeholder="width"/>
    <input [(ngModel)]="height" placeholder="height"/>

    <div class='space'>
      <svg>
      </svg>

      <div id='box-{{user.id}}' class='user-box'>
        {{user.username}}
        {{user.text}}
      </div>

      <div *ngFor="let note of notes" id="box-{{note.id}}" class='box'>
        <my-note-detail [note]="note"> </my-note-detail>
      </div>
      <div *ngFor="let note of notes" id="handle-{{note.id}}" class='handle'></div>

    </div>
  `,
  styles:[`
    .space {
      position: relative;
      //border: 1px solid lavender;
    }
    svg {
      border: 1px solid lavender;
    }
    .handle {
      position: absolute;
      z-index: 100000;
      width: 20px;
      height: 20px;
      opacity: .8;
      background-color: azure;
      border-radius: 4px;
      border: 1px solid steelblue;
    }
    .handle.fixed {
      background-color: lavender;
    }
    .handle:hover {
      cursor: pointer;
    }
    .box {
      position: absolute;
      z-index: 0;
      opacity: .85;
      border-radius: 4px;
      border: 1px solid steelblue;
    }
    .box:hover {
      background-color: azure;
    }
    .user-box {
      position: absolute;
      z-index: 100000;
      opacity: .85;
      padding: 5px;
      border-radius: 4px;
      border: 1px solid steelblue;
      width: 270px;
      height: 180px;
      background-color: white;
    }
  `],
  directives: [
    NoteStreamComponent,
    NoteDetailComponent
  ]
})
export class NotationComponent implements OnInit, AfterViewChecked {
  // the models
  user: User;
  notes: Note[] = [];

  nodes: any[] = [];
  relations: Relation[] = [];

  notes_by_id = {};

  presenting = null;
  newNote: Note; //TODO add new note
  edging_note = null; // the note with a pending edge making

  // the html elements
  boxes; // holds note-details
  handles; // handles dragging, pinning
  links;

  origin;

  handleZ = 100000; // eventually a box click will cover an untouched node...
  boxZ = 0;

  loaded = false;

  // d3.layout.force params
  force;
  width = 10000;
  height = 10000;
  gravity = 0.15;
  friction = .8;
  linkDistance = 220;
  linkStrength = 0.4;
  charge = -7000;
  theta = 0.8;
  alpha = 0.1;

  counter = 0;

  constructor(
    private authService: AuthService,
    private notationService: NotationService
  ) { }
  // add user to view; make it toggleable
  // drag note into other note
  // draw edges with arrows

  ngOnInit() {
    this.spaceOut();

    this.loadUser();

    this.getNotation();
  }  
  ngAfterViewChecked() {
    if (this.notes && this.force && !this.loaded) {
      // runs once, after note components are loaded
      // load notes into boxes w/ handles
      this.loaded = true;

      this.notes.forEach((note) => { // bind each note to the right box/handle
        this.loadNote(note);
      });

      this.boxes = d3.selectAll('.box');
      this.handles = d3.selectAll('.handle');
    }
    if (this.presenting) {
      let note = this.presenting;
      this.presenting = null;

      this.loadNote(note);

      this.boxes = d3.selectAll('.box');
      this.handles = d3.selectAll('.handle');
      console.log('boxes', this.boxes);
      console.log('handles', this.handles);
      this.startForce();
    }
  }
  spaceOut() {
    // resize
    let space = d3.select('.space')
      .attr('width', this.width)
      .attr('height', this.height);
    let svg = space.select('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('dblclick', () => {
        if (d3.event.shiftKey) {
          this.presentBand(d3.event);
        } else {
          this.presentNote(d3.event);
        }
      });
    // draw coordinates
    this.origin = { x: this.width / 2,  y: this.height / 2};
    let interval = 200
    for (let i = 0; i < this.height/2; i += interval) {
      [-1, 1].forEach((direction) => {
        let y = this.origin.y + direction*i;
        svg.append('line') // horizontals
          .attr('class', 'axis')
          .attr('x1', 0)
          .attr('y1', y)
          .attr('x2', this.width)
          .attr('y2', y)
          .attr('stroke', (d) => { 
            if (i == 0) { return 'steelblue'; }
            return 'lavender';
          })
          .attr('stroke-width', (d) => {
            if (i == 0) { return 2; }
            return 1; 
          });
        let x = this.origin.x + direction*i
        svg.append('line') // verticals
          .attr('class', 'axis')
          .attr('x1', x)
          .attr('y1', 0)
          .attr('x2', x)
          .attr('y2', this.height)
          .attr('stroke', (d) => {
            if (i == 0) { return 'steelblue'; }
            return 'lavender';
          })
          .attr('stroke-width', (d) => {
            if (i == 0) { return 2; }
            return 1; 
          });
      });
    }
    // center view
    let header = document.getElementById('site-header');
    let x = this.origin.x - window.innerWidth / 2;
    let y = this.origin.y - window.innerHeight / 2 + header.offsetHeight + 25;
    window.scroll(x, y);
  }
  userX(viewX: number) {
    return viewX - this.origin.x;
  }
  userY(viewY: number) {
    return this.origin.y - viewY;
  }
  viewX(userX: number) {
    return userX + this.origin.x;
  }
  viewY(userY: number) {
    return this.origin.y - userY;
  }
  loadUser() {
    this.user = this.authService.getUser();

    this.user.x = this.origin.x;
    this.user.y = this.origin.y;
    this.user.fixed = true;

    let userbox = d3.select('.user-box');
    console.log(userbox);
    userbox
      .data([ this.user ])
      .style('left', function(d) {
        console.log('offwi', this.offsetWidth);           
        return d.x-this.offsetWidth/2+'';
      })
      .style('top', function(d) {
        console.log('offhe', this.offsetHeight);  
        return d.y-this.offsetHeight/2+'';
      });

    console.log('user', this.user);
    console.log('userbox', userbox);

    this.nodes.push(this.user);
  }
  getNotation() { // getNotes does everything for notes 
    this.notationService.getNotation()
      .subscribe(
        (notation) => {
          console.log('notation', notation);
          if (notation) {
            notation.forEach((unit) => {
              unit.note.x = this.viewX(unit.note.user_x);
              unit.note.y = this.viewY(unit.note.user_y);
              this.notes.push(unit.note);
              this.nodes.push(unit.note);
              this.relations.push.apply(unit.out_relations);

              this.notes_by_id[unit.note.id] = unit.note // map needed to get links
            });
            console.log('notes', this.notes);

            this.loadRelations();

            this.initForce();
            this.startForce();
          }
        },
        (error) => { console.error('error', error); }
      );
  }
  loadNote(note: Note) {
    let space = d3.select('.space');
    space.select('#box-'+note.id)
      .data([ note ])
      .on('click', (d) => {
        this.boxZ++;
        document.getElementById('box-'+d.id).style.zIndex = this.boxZ+'';
        this.handleZ++;
        document.getElementById('handle-'+d.id).style.zIndex = this.handleZ+'';
      });

    space.select('#handle-'+note.id)
      .data([ note ])
      .classed('fixed', (d) => d.fixed)
      .on('click', (d) => {
        this.handleZ++;
        document.getElementById('handle-'+d.id).style.zIndex = this.handleZ+'';
        this.boxZ++;
        document.getElementById('box-'+d.id).style.zIndex = this.boxZ+'';
      })
      .on('dblclick', (d) => {
        d.fixed = false;
        document.getElementById('handle-'+d.id).classList.remove('fixed');
      })
      .call(
        this.force.drag().on("dragstart", (d) => {
          d.fixed = true;
          document.getElementById('handle-'+d.id).classList.add('fixed');
        })
      );
  }
  loadRelations() { // load notes into relations into links (between boxes w/ handles)
    this.relations.forEach((relation, i, array) => {
      relation.source = this.notes_by_id[relation.sourceid];
      relation.target = this.notes_by_id[relation.targetid];
      array[i] = relation;
    });
    console.log('relations', this.relations);

    this.links = d3.select('svg').selectAll('.link')
      .data(this.relations) // make these paths with arrows
      .enter().append('line')
        .attr('class', 'link')
        .attr('stroke', 'steelblue')
        .attr('stroke-width',2);
      //.exit().remove();
    console.log('links', this.links);
  }
  initForce() {
    this.force = d3.layout.force()
      .size([this.width, this.height])
      .nodes(this.nodes)
      .links(this.relations)
      .gravity(this.gravity)
      .friction(this.friction)
      .linkDistance((d) => {
        // get the length of the diagonal?
        let distance = this.linkDistance;
        return distance;
      })
      .linkStrength((d) => {
        // operate on link type
        let strength = this.linkStrength;
        return strength;
      })
      .charge((d) => {
        // vary by note size, we
        let charge = this.charge;
        return charge;
      })
      .theta(this.theta)
      //.alpha(this.alpha)
      .on('tick', () => {
        console.log('tick');

        if (this.links) {
          this.links//.transition().ease('linear').duration(this.animationStep)
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        }
        if (this.boxes) {
          this.boxes
            .style('left', function(d) {               
              return d.x-this.offsetWidth/2+'';
            })
            .style('top', function(d) {
              return d.y-this.offsetHeight/2+'';
            });
        }
        if (this.handles) {
          this.handles
            .style('left', function(d) { 
              let box = document.getElementById('box-'+d.id);
              return d.x-box.offsetWidth/2-5+'';
            })
            .style('top', function(d) {
              let box = document.getElementById('box-'+d.id);
              return d.y-box.offsetHeight/2-5+'';
            });
        }
        this.notes.forEach((note) => {
          note.user_x = this.userX(note.x);
          note.user_y = this.userY(note.y);
        });
      });
    console.log('force', this.force);
  }
  startForce() {
    this.force.start();
  }
  stopForce() {
    this.force.stop();
  }
  presentNote(event: any) {
    console.log(event);
    let markid = 'mark-' + this.counter;
    this.counter++;

    d3.select('svg').append('circle')
      .attr('id', markid)
      .attr('r', 5)
      .attr('cx', event.offsetX)
      .attr('cy', event.offsetY)
      .attr('fill', 'azure')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1);

    let note = new Note();
    note.x = event.offsetX;
    note.y = event.offsetY;
    note.user_x = this.userX(note.x);
    note.user_y = this.userY(note.y);

    this.notationService.saveNote(note).subscribe(
      (note) => {
        console.log('posted!', note)
        this.notes.push(note);
        this.notes_by_id[note.id] = note;

        this.presenting = note;

        d3.select('#' + markid).remove();
      },
      (error) => { console.error(error); }
    );
  }
  presentBand(event: any) {
    console.error('not yet implemented')
  }
}
