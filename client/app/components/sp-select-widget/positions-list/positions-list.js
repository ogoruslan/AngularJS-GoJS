'use strict';

import positionsListComponent from './positions-list.component';

let positionsListModule = angular.module('positionsList', [])
.config(($compileProvider) => {
  'ngInject';
  $compileProvider.onChangesTtl(0);
})
.component('positionsList', positionsListComponent)

.name;

export default positionsListModule;
