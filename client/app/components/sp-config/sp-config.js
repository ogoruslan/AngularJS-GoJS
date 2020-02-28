'use strict';

import spConfigService from './sp-config.service';

let spConfigModule = angular.module('spConfig', [])

.factory('spConfig', spConfigService)

.name;

export default spConfigModule;
