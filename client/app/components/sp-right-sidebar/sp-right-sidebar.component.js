'use strict';

import template from './sp-right-sidebar.html';
import controller from './sp-right-sidebar.controller';
import './sp-right-sidebar.scss';

let spRightSidebarComponent = {
    restrict: 'E',
    transclude: true,
    bindings: {
        spVisible: '<'
    },
    template,
    controller
};

export default spRightSidebarComponent;
