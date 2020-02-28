'use strict';

import cmSnackbarService from './cm-snackbar.service';
import './cm-snackbar.scss';

let cmSnackbarModule = angular.module('cmSnackbar', [])

.factory('cmSnackbar', cmSnackbarService)

.name;

export default cmSnackbarModule;
