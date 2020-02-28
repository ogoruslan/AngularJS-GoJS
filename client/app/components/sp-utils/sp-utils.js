'use strict';

import spUtilsService from './sp-utils.service';

let spUtilsModule = angular.module('spUtils', [])

.factory('spUtils', spUtilsService)

.name;

export default spUtilsModule;
