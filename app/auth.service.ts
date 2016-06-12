import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { User } from './models/user';

@Injectable()
export class AuthService {
  private registerUrl = 'api/register';
  private loginUrl = 'api/login';

  loginSuccess: Observable<any>;
  private loginSuccessObserver: Observer<any>;

  constructor(private http: Http) {
    this.loginSuccess = new Observable((observer) => {
      this.loginSuccessObserver = observer;
    }).share() // is there a more direct way to output to app?
  }

  private handleError(error: any) {
    let errMsg = (error.json().message) ? error.json().message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    return Observable.throw(errMsg);
  }

  register(username, password): Observable<any> {
    let body = JSON.stringify({username: username, password: password});
    let headers = new Headers({'Content-Type': 'application/json'});

    return this.http.post(this.registerUrl, body, {headers: headers})   
      .map((res) => {
        let data = res.json();
        console.log(data);
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user)); 

          this.loginSuccessObserver.next(data);
        }
        return data;
      })
      .catch(this.handleError);
  }

  login(username, password): Observable<any> {
    let body = JSON.stringify({username: username, password: password});
    let headers = new Headers({'Content-Type': 'application/json'});

    return this.http.post(this.loginUrl, body, {headers: headers})
      .map((response) => {
        let data = response.json();
        console.log(data);
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user)); 

          this.loginSuccessObserver.next(data);
        }
        return data;
      })
      .catch(this.handleError);
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // http request to nofify server of logout details?
  }
  getToken() {
    return localStorage.getItem('token');
  }
  getUser() {
    let user = localStorage.getItem('user');
    if (user) return JSON.parse(user);
  }
  getAuth() {
    var token = localStorage.getItem('token');
    var user = localStorage.getItem('user');

    if (token && user) {
      return {
        'token': token,
        'user': JSON.parse(user)
      };
    }
    return null;
  }

}
