'use strict';

import CMStrategicalPlanning from './cm-strategical-planning/cm-strategical-planning';
import CMLogin from './cm-login/cm-login';

let pagesModule = angular.module('app.pages', [
    CMStrategicalPlanning,
    CMLogin
])
.name;

export default pagesModule;
