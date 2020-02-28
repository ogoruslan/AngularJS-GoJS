'use strict';

import template from './sp-zoombar.html';
import controller from './sp-zoombar.controller';
import './sp-zoombar.scss';

let spZoombarComponent = {
    restrict: 'E',
    bindings: {
        spDiagram: '<'
    },
    template,
    controller
};

export default spZoombarComponent;
