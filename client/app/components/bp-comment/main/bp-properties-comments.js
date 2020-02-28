'use strict';

import bpPropertiesCommentsComponent from './bp-properties-comments.component';
import bpGetElementHeight from './bp-properties-comments.set-height';
import bpWatchElemHeight from './bp-properties-comments.watch-height';

let bpPropertiesCommentsModule = angular.module('bpPropertiesComments', [])

  .component('bpPropertiesComments', bpPropertiesCommentsComponent)
  .directive('bpGetElementHeight', bpGetElementHeight)
  .directive('bpWatchElemHeight', bpWatchElemHeight)

  .name;

export default bpPropertiesCommentsModule;
