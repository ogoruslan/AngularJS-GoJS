'use strict';

import template from './sp-date.html';
import controller from './sp-date.controller';
import './sp-date.scss';

let spDateComponent = {
    restrict: 'E',
    bindings: {
        spData: '<',
        onDateChanged:'&'
    },
    template,
    controller
};

export default spDateComponent;
