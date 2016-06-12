import { Component, OnInit } from '@angular/core';

import { AuthService } from './auth.service';

@Component({
  selector: 'my-signup',
  template: `
    <input [(ngModel)]="username" type="text" placeholder="username" />
    <input [(ngModel)]="password" type="password" placeholder="password" />
    <button (click)="register()" >Register</button>
    <div *ngIf="error" class="error">{{error}}</div>
  `
})
export class RegisterComponent {
  private username;
  private password;
  private error;

  constructor(private authService: AuthService) { }

  register() {
    this.error = null;

    this.authService.register(this.username, this.password).subscribe(
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
