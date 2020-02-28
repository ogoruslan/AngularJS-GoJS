'use strict';

import template from './sp-assign-user.html';
import controller from './sp-assign-user.controller';
import './sp-assign-user.scss';

let spAssignUserComponent = {
	restrict: 'E',
	bindings: {
		spName: '<',
		spType: '<',
		spPositions: '<',
		spSearchPositions: '<',
		spAddPosition: '<',
		spInviteUser: '<',
		onPositionAdded: '&',
		onPositionsAdded: '&',
		onPositionRemoved: '&',
        spSearchUsers: '<',
        onPermissionChanged: "&",
        spPermission: '<'
	},
	template,
	controller
};

export default spAssignUserComponent;
