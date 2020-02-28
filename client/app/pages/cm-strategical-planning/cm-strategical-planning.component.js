'use strict';

import template from './cm-strategical-planning.html';
import controller from './cm-strategical-planning.controller';
import './cm-strategical-planning.scss';

let cmStrategicalPlanningComponent = {
    restrict: 'E',
    bindings: {
        cmApiHost: '@',
        cmCurrentUser: '<',
        authData: '<'
    },
    template,
    controller
};

export default cmStrategicalPlanningComponent;
