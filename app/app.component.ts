import { Component, OnInit } from '@angular/core';
import { Router, RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router-deprecated';

import { AuthService } from './auth.service';
import { NotationService } from './notation.service';

import { HomeComponent } from './home.component';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { NotationComponent } from './notation.component';
import { NoteStreamComponent } from './note-stream.component';
import { NoteDetailComponent } from './note-detail.component';

import './rxjs-operators';

@Component({
  selector: 'my-app',
  template: `
    <div id="site-header">
      <div class="header-logo">&nbsp;novel<span class="n">n</span>&nbsp;</div>
      <div *ngIf="!loggedIn" class="header-content">
        <a [routerLink]="['Home']">home</a>
        <a [routerLink]="['Login']">login</a>
        <a [routerLink]="['Register']">register</a>
      </div>
      <div *ngIf="loggedIn" class="header-content">
        <a [routerLink]="['Home']">home</a>
        <a [routerLink]="['Notation']">notation</a>
        <a [routerLink]="['Notestream']">notestream</a>
        <a [routerLink]="['Home']" (click)="logout()">logout</a>
      </div>
      <div class="clear"></div>
    </div>
    <div id="site-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
  `],
  directives: [
    //COMMON_DIRECTIVES,
    ROUTER_DIRECTIVES
  ],
  providers: [
    AuthService,
    NotationService
  ]
})
@RouteConfig([
  { path: '/', name: 'Home', component: HomeComponent, useAsDefault: true },
  { path: '/login', name: 'Login', component: LoginComponent },
  { path: '/register', name: 'Register', component: RegisterComponent },
  { path: '/notation', name: 'Notation', component: NotationComponent },
  { path: '/notestream', name: 'Notestream', component: NoteStreamComponent },
  { path: '/detail/:id', name: 'NoteDetail', component: NoteDetailComponent },
])
export class AppComponent implements OnInit {
  title = 'noveln';
  taglines = [
    'the n stands for notation',
    'present your reasoning',
    'let every note build opon the others',
    'outline everything. what exactly is an outline?'
  ];

  private loggedIn = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    if (this.authService.getAuth()) {
      this.loggedIn = true;
    }
    this.authService.loginSuccess.subscribe( // subscribe to future logins
      (auth) => { 
        this.loggedIn = true;
        //this.profile = auth.profile; 
        this.router.navigate(['Notation']);
      },
      (error) => { 
        console.log(error);
      }
    );
    console.log('logged in',this.loggedIn);
  }

  logout() {
    this.loggedIn = false;
    this.authService.logout();
    this.router.navigate(['Home']);
  }
};
