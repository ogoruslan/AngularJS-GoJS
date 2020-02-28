'use strict';

import template from './bp-properties-comments.html';
import controller from './bp-properties-comments.controller';
import './bp-properties-comments.scss';

let bpPropertiesCommentsComponent = {
  restrict: 'E',
  bindings: {
    bpComments: '<',
    onCommentsChanged: '&'
  },
  template,
  controller
};

export default bpPropertiesCommentsComponent;
