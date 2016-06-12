import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Relation } from './models/relation';
import { Note } from './models/note';
import { Observable } from 'rxjs/Observable';
//import { UserService } from './user.service';
import { AuthService } from './auth.service';

@Injectable()
export class NotationService {
  private notationUrl = 'api/notation' // used to get notes and edges
  private noteUrl = '/api/note'; // used to post/put/delete notes
  private relationUrl = '/api/relation'; // used to post/put/delete relations
  private token;

  constructor(private http: Http, 
    private authService: AuthService) {
  }
  private handleError(error: any) {
    let errMsg = (error.json().message) ? error.json().message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg);
    return Observable.throw(errMsg);
  } 
  private headers() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'token': this.authService.getToken()
    });
    return headers;
  }

  getNotation(): Observable<any> { // returns notes and relations, depth=1
    let headers = this.headers();
    return this.http.get(this.notationUrl, {headers: headers})
      .map((res) => {
        console.log(res);
        return res.json();
      })
      .catch(this.handleError);
  }

  saveNote(note: Note): Observable<Note> {
    if (note.id) { return this.putNote(note); }
    else { return this.postNote(note); }
  }
  private postNote(note: Note): Observable<Note> {
    let body = JSON.stringify(note);
    let headers = this.headers();
    return this.http.post(this.noteUrl, body, {headers: headers})
      .map(res => {
        console.log(res);
        return res.json();
       })
      .catch(this.handleError);
  }
  private putNote(note: Note): Observable<Note> {
    let url = `${this.noteUrl}/${note.id}`;
    let body = JSON.stringify(note)
    let headers = this.headers();
    return this.http.put(url, body, {headers: headers})
      .map(res => res.json())
      .catch(this.handleError);
  }
  deleteNote(note: Note): Observable<any> {
    let url = `${this.noteUrl}/${note.id}`;
    let headers = this.headers();
    return this.http.delete(url, headers)
      .map(res => {
        console.log(res);
        return res.json();
      })
      .catch(this.handleError);
  }

  saveRelation(relation: Relation): Observable<Relation> {
    if (relation.id) { return this.putRelation(relation); }
    else { this.postRelation(relation); }
  }
  private postRelation(relation): Observable<Relation> {
    let body = JSON.stringify(relation);
    let headers = this.headers();
    return this.http.post(this.relationUrl, body, {headers: headers})
      .map(res => {
        console.log(res);
        return res.json();
      })
      .catch(this.handleError);
  }
  private putRelation(relation): Observable<Relation> {
    let url = `${this.relationUrl}/${relation.id}`;
    let body = JSON.stringify(relation);
    let headers = this.headers();
    return this.http.put(url, body, {headers: headers})
      .map(res => {
        console.log(res);
        return res.json();
      })
      .catch(this.handleError);
  }
  deleteRelation(relation): Observable<any> {
    let url = `${this.relationUrl}/${relation.id}`;
    let headers = this.headers();
    return this.http.delete(url, headers)
      .map(res => {
        console.log(res);
        return res.json();
      })
      .catch(this.handleError);
  }

  clone(obj) {
    var copy;
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;
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
            if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
        }
        return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
  }


}
