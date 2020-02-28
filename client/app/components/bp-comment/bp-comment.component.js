'use strict';

import template from './bp-comment.html';
import controller from './bp-comment.controller';
import './bp-comment.scss';

let bpCommentComponent = {
  restrict: 'E',
  bindings: {
    bpText: '<',
    bpId: '<',
    bpDateCreated: '<',
    bpDateUpdated: '<',
    bpCreatedByFirstname: '<',
    bpCreatedByLastname: '<',
    bpCreatedByPosition: '<',
    bpCreatedByPicture: '<',
    bpShowActions: '<',
    bpIsDeleted: '<',
    bpIsLast: '<',
    bpOnDelete: '&',
    bpOnEditCommit: '&',
    bpOnEditStart: '&',
    bpOnEditEnd: '&',
    bpOnRestore: '&'
  },
  template,
  controller
};

export default bpCommentComponent;
