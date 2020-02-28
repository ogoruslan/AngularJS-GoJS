'use strict';

import CMAthentication from './cm-authentication/cm-authentication';
import CMSnackbar from './cm-snackbar/cm-snackbar';

let componentsModule = angular.module('app.components', [
    CMAthentication,
    CMSnackbar
])

.name;

export default componentsModule;
