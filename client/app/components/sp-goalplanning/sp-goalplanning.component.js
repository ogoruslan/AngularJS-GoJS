'use strict';

import template from './sp-goalplanning.html';
import controller from './sp-goalplanning.controller';
import './sp-goalplanning.scss';

let spGoalplanningComponent = {
    restrict: 'E',
    bindings: {
        onGoaldiagramInit: '&',
        onSelectedNodeData:'&',
        spAvoidingRightSidebarWidth: '<',
        onRightSidebarInit: '&',
        spNodes: '<',
        spSelected: '<',
        spEntityAdded: '<',
        spEntityRemoved: '<',
        spEntityPositionsAdded: '<',
        spEntityPositionsRemoved: '<'
    },
    template,
    controller
};

export default spGoalplanningComponent;
