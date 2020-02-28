'use strict';

import spSnackbarService from './sp-snackbar.service';
import './sp-snackbar.scss';

let spSnackbarModule = angular.module('spSnackbar', [])

.factory('spSnackbar', spSnackbarService)

.name;

export default spSnackbarModule;
