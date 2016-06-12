import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/common';
import { RouteParams } from '@angular/router-deprecated';

import { Note } from './models/note';
import { NotationService } from './notation.service';
import { Autosize } from './autosize.directive';

import { ResizeSensor } from 'css-element-queries';

// TODO use ng-pristine, ng-dirty instead of classes?
@Component({
  selector: 'my-note-detail',
  template: `
    <div id="note-{{note.id}}" class="note"
      [class.dirty]="dirtied"
      [class.flagged]="note.flagged"
      (mouseenter)="showControls()"
      (mouseleave)="hideControls()"
      (resize)="onResize(event)">
      <div class="surface">
        <textarea autosize 
          [(ngModel)]="note.text"
          (keyup)="dirty()" placeholder="text" cols="40">
          (mouseup)="mouseup(event)"
          (resize)="onResize(event)"
        </textarea>
      </div>
      <div class="controls hidden">
        <button (click)="startEdge()">start-bond</button>
        <button (click)="finishEdge()">finish-bond</button>
        
        <button (click)="toggleFlag()">Flag</button>
        <button (click)="toggleDetail()">Detail</button>
        <button [hidden]="!dirtied" (click)="save()">Save</button>
        <button [hidden]="!dirtied" (click)="refresh()">Refresh</button>
      </div>
      <div class="detail" [hidden]="!detailed">
        <div class="table">
          <div class="row">
            <div class="cell left">id:</div>
            <div class="cell right">{{note.id}}</div>
          </div>
          <div class="row">
            <div class="cell left">presented:</div>
            <div class="cell right">{{note.presented}}</div>
          </div>
          <div class="row">
            <div class="cell left">presentedby:</div>
            <div class="cell right">{{note.presentedby}}</div>
          </div>
          <div class="row">
            <div class="cell left">lastmodified:</div>
            <div class="cell right">{{note.lastmodified}}</div>
          </div>
          <div class="row">
            <div class="cell left">lastmodifiedby:</div>
            <div class="cell right">{{note.lastmodifiedby}}</div>
          </div>
          <div class="row">
            <div class="cell left">x:</div>
            <div class="cell right">
              <input class="detail-input"[(ngModel)]="note.user_x" (keyup)="dirty()"/>
            </div>
          </div>
          <div class="row">
            <div class="cell left">y:</div>
            <div class="cell right">
              <input class="detail-input"[(ngModel)]="note.user_y" (keyup)="dirty()"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles:[`
    .note {
      margin:8px;
      padding: 2px;
      border: 1px solid lavender;
      border-radius: 5px;
      position: relative;
      cursor: grab;
      background-color: white;
      display: block;
    }
    .edging {
      background-color: steelblue;
    }
    .dirty {
      border: 2px solid red;
    }
    .flagged {
      border: 2px solid darkturquoise;
    }
    .note-text {
      max-height: 200px;
    }
    .detail {
      border: 1px solid lavender;
      font-size: small;
    }
    .table {
      display: table;
      width: 100%;
    }
    .row {
      display: table-row;
    }
    .cell {
      display: table-cell;
      padding: 1px;
    }
    .left {
      text-align: right;
      padding-right: 2px;
    }
    .right {
      text-align: left;
      padding-right: 2px;
    }
    .hidden {
      display: none;
    }
    .detail-input {
      width: 100%;
    }
  `],
  directives: [Autosize]
})
// TODO: merge back with notescomponent?
export class NoteDetailComponent implements OnInit {
  @Input() note: Note;
  @Output() edgingSource = new EventEmitter();
  @Output() edgingTarget = new EventEmitter();

  private pristineNote: Note;
  private detailed = false;
  private dirtied = false;

  constructor(
    private routeParams: RouteParams,
    private notationService: NotationService
  ) { }

  ngOnInit() {
    console.log(this.note);

    this.pristineNote = this.notationService.clone(this.note);

/*
    var element = document.getElementById('note-'+this.note.id);
    new ResizeSensor(element, function() {
        console.log('resize', element);
    });
    if (this.note.width) {
    }*/
  }
  showControls() {
    let note = document.getElementById('note-'+this.note.id);
    note.getElementsByClassName('controls').item(0).classList.remove('hidden');
  }
  hideControls() {
    let note = document.getElementById('note-'+this.note.id);
    note.getElementsByClassName('controls').item(0).classList.add('hidden');
  }
  toggleFlag() {
    this.note.flagged = !this.note.flagged;
    this.dirtied = true;
  }
  toggleDetail() {
    this.detailed = !this.detailed;
  }
  dirty() {
    this.dirtied = true;
  }
  mouseup(event) {
    console.log('mouseup', event);
  }
  onResize(event) {
    console.log('resize',event); //TODO record resize
  }
  startEdge() {
    this.edgingSource.emit(this.note);
  }
  finishEdge() {
    this.edgingTarget.emit(this.note);
  }
  save() {
    if (this.note.id) {
      var snapshot = this.notationService.clone(this.note);
    }
    //this.note.height = 100;
    //this.note.width = 12;
    this.notationService.saveNote(this.note).subscribe((result) => {
      console.log(result);
      if (this.note.id) {
        this.pristineNote = snapshot; //PUT
      } else {
        // right now we dont keep the note, we wipe it to reuse this as a new note form
        this.refresh() //POST
      }
      this.dirtied = false;
    });
  }
  refresh() {
    // return to original size
    this.note = this.notationService.clone(this.pristineNote);
    this.dirtied = false;
  }
}
