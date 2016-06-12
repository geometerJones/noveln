import { bootstrap } from '@angular/platform-browser-dynamic';
import { provide } from '@angular/core';
import { FORM_PROVIDERS } from '@angular/common';
import { ROUTER_PROVIDERS } from '@angular/router-deprecated';
import { Http, HTTP_PROVIDERS } from '@angular/http';

// TODO check out demo backend
//import { XHRBackend } from '@angular/router-deprecated'
//import { InMemoryBackendService, SEED_DATA } from 'angular2-in-memory-web-api/in-memory-backend.service';
//import { InMemoryDataService } from './in-memory-data.service';


import { AppComponent } from './app.component';

bootstrap(AppComponent, [
  FORM_PROVIDERS,
  ROUTER_PROVIDERS,
  HTTP_PROVIDERS
  //provide(XHRBackend, { useClass: InMemoryBackendService }),
  //provide(SEED_DATA, { useClass: InMemoryDataService })
]);
