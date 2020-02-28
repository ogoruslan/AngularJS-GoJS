'use strict';

import spGoalplanningModelService from './sp-goalplanning-model.service';

let spGoalplanningModelModule = angular.module('spGoalplanningModel', [])

.factory('spGoalplanningModel', spGoalplanningModelService)

.name;

export default spGoalplanningModelModule;
