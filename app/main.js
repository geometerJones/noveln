"use strict";
var platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
var common_1 = require('@angular/common');
var router_deprecated_1 = require('@angular/router-deprecated');
var http_1 = require('@angular/http');
// TODO check out demo backend
//import { XHRBackend } from '@angular/router-deprecated'
//import { InMemoryBackendService, SEED_DATA } from 'angular2-in-memory-web-api/in-memory-backend.service';
//import { InMemoryDataService } from './in-memory-data.service';
var app_component_1 = require('./app.component');
platform_browser_dynamic_1.bootstrap(app_component_1.AppComponent, [
    common_1.FORM_PROVIDERS,
    router_deprecated_1.ROUTER_PROVIDERS,
    http_1.HTTP_PROVIDERS
]);
//# sourceMappingURL=main.js.map