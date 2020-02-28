'use strict';

import template from './cm-login.html';
import controller from './cm-login.controller';
import './cm-login.scss';

let cmLoginComponent = {
    restrict: 'E',
    bindings: {
        data: '<'
    },
    template,
    controller
};

export default cmLoginComponent;
