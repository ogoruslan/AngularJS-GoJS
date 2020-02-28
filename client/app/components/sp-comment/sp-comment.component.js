'use strict';

import template from './sp-comment.html';
import controller from './sp-comment.controller';
import './sp-comment.scss';

let spCommentComponent = {
  restrict: 'E',
  bindings: {
    spText: '<',
    spId: '<',
    spDateCreated: '<',
    spDateUpdated: '<',
    spCreatedByFirstname: '<',
    spCreatedByLastname: '<',
    spCreatedByPosition: '<',
    spCreatedByAvatar: '<',
    spShowActions: '<',
    spIsDeleted: '<',
    spIsLast: '<',
    spOnDelete: '&',
    spOnEditCommit: '&',
    spOnEditStart: '&',
    spOnEditEnd: '&',
    spOnRestore: '&'
  },
  template,
  controller
};

export default spCommentComponent;
