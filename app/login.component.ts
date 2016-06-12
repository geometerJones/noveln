import { Component, OnInit } from '@angular/core';

import { AuthService } from './auth.service';

@Component({
  selector: 'my-login',
  template: `
    <input [(ngModel)]="username" type="text" placeholder="username" />
    <input [(ngModel)]="password" type="password" placeholder="password" />
    <button (click)="login()" >Login</button>
    <div *ngIf="error" class="error">{{error}}</div>
  `
})
export class LoginComponent {
  private username;
  private password;
  private error;

  constructor(private authService: AuthService) { }

  login() {
    this.error = null;

    this.authService.login(this.username,this.password).subscribe(
      (auth) => {
        if (!auth || !auth.token || !auth.user) {
          this.error = 'auth failed...?'
          console.error(auth);
        }
      }, 
      (error) => {
        this.error = error;
      }
    );
  }
}
