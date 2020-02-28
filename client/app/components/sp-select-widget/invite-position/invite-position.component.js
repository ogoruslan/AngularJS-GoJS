'use strict';

import template from './invite-position.html';
import controller from './invite-position.controller';
import './invite-position.scss';

let invitePositionComponent = {
	restrict: 'E',
	bindings: {
		spPositions: '<',
		onPositionCreated: '&',
        spSearchUsers: '<'
	},
	template,
	controller
};

export default invitePositionComponent;
