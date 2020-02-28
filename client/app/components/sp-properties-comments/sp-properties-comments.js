'use strict';

import spPropertiesCommentsComponent from './sp-properties-comments.component';
import spGetElementHeight from './sp-properties-comments.set-height';
import spWatchElemHeight from './sp-properties-comments.watch-height';

let spPropertiesCommentsModule = angular.module('spPropertiesComments', [])

  .component('spPropertiesComments', spPropertiesCommentsComponent)
  .directive('spGetElementHeight', spGetElementHeight)
  .directive('spWatchElemHeight', spWatchElemHeight)

  .name;

export default spPropertiesCommentsModule;
