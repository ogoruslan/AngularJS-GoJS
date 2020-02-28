'use strict';

import spGoalplanningComponent from './sp-goalplanning.component';
import spGoalplanningTemplates from './sp-goalplanning-templates.service';
import spGoalplanningConfig from './sp-goalplanning-config.service';
import spGoalplanningState from './sp-goalplanning-state.service';
import spGoalplanningTextEditor from './sp-goalplanning-texteditor.service';

let spGoalplanningModule = angular.module('spGoalplanning', [])

.component('spGoalplanning', spGoalplanningComponent)
.factory('spGoalplanningTemplates', spGoalplanningTemplates)
.factory('spGoalplanningConfig', spGoalplanningConfig)
.factory('spGoalplanningState', spGoalplanningState)
.factory('spGoalplanningTextEditor', spGoalplanningTextEditor)
.name;

export default spGoalplanningModule;
