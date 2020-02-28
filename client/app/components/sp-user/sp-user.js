'use strict';

import spUserComponent from './sp-user.component';

let spUserModule = angular.module('spUser', [])

.component('spUser', spUserComponent)

.name;

export default spUserModule;
