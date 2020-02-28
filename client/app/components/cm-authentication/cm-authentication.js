'use strict';

import cmAuthenticationService from './cm-authentication.service';

let cmAuthenticationModule = angular.module('cmAuthentication', [])
    .service('cmAuthentication', cmAuthenticationService)
    .name;

export default cmAuthenticationModule;
