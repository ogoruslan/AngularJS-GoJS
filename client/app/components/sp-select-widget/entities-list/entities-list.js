'use strict';

import entitiesListComponent from './entities-list.component';

let entitiesListModule = angular.module('entitiesList', [])

.component('entitiesList', entitiesListComponent)

.name;

export default entitiesListModule;
