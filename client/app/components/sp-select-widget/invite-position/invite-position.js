'use strict';

import invitePositionComponent from './invite-position.component';

let invitePositionModule = angular.module('invitePosition', [])

.component('invitePosition', invitePositionComponent)

.name;

export default invitePositionModule;
