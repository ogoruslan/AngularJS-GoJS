'use strict';

import CPGojsToolbarFactory from './sp-gojs-toolbar.service';

let spGojsToolbarModule = angular.module('spGojsToolbar', [])

.factory('spGojsToolbar', CPGojsToolbarFactory)

.name;

export default spGojsToolbarModule;
