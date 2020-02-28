'use strict';

import template from './sp-properties-comments.html';
import controller from './sp-properties-comments.controller';
import './sp-properties-comments.scss';

let spPropertiesCommentsComponent = {
  restrict: 'E',
  bindings: {
    spComments: '<',
    onCommentsChanged: '&',
    currentUser: '<',
    scrollAreaHeight: '<'
  },
  template,
  controller
};

export default spPropertiesCommentsComponent;
