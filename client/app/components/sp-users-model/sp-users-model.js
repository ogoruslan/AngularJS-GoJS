'use strict';

import spUsersModelService from './sp-users-model.service';

let spUsersModelModule = angular.module('spUsersModel', [])

.factory('spUsersModel', spUsersModelService)

.name;

export default spUsersModelModule;
