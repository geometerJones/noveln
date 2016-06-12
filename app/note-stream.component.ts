import { Component, ElementRef, OnInit } from '@angular/core';
import { CanActivate } from '@angular/router-deprecated';
import { Note } from './models/note';
import { NotationService } from './notation.service'
import { NoteDetailComponent } from './note-detail.component';

//import { Observable } from 'rxjs/Observable';
import { Autosize } from './autosize.directive';

@Component({
  selector: 'my-notes',
  template: `
    <div class="channel">
      <div class="stream">
        <div *ngFor="let note of notes" class="slice">
          <my-note-detail [note]="note"></my-note-detail>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .channel {
      width: 100%;
      // TODO: adjust to match window height;
      overflow-x: scroll;
      border: 1px solid lavender;
    }
    .stream {
      //display: table-row;
    }
    .slice {
      display: inline-block; //table-cell;
    }
  `],
  directives: [
    NoteDetailComponent
  ],
})
//@CanActivate(() => tokenNotExpired())
export class NoteStreamComponent implements OnInit {
  notes: Note[] = [];
  error: any;

  // how do i apply a class to the s
  constructor(
    private notationService: NotationService
  ) { }
  ngOnInit() {
    this.getNotes();
  }
  getNotes() {
    this.notationService.getNotation()
      .subscribe(
        (units) => {
          units.forEach((unit) => {
            this.notes.push(unit.n);
          });
          this.scrollRight();
        },
        (error) => {
          console.error(error);
        }
      );
  }
  scrollRight() {
    let channel = document.getElementsByClassName("channel").item(0);
    setTimeout(() => {
      channel.scrollLeft = channel.scrollWidth - channel.clientWidth
    }, 0);
  }
};
