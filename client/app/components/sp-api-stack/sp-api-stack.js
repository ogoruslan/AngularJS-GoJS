'use strict';

import SPAPIStackFactory from './sp-api-stack.service';

let spAPIStackModule = angular.module('spAPIStack', [])

.factory('spAPIStack', SPAPIStackFactory)

.name;

export default spAPIStackModule;
