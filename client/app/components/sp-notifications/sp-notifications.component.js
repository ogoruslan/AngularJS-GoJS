'use strict';

import template from './sp-notifications.html';
import controller from './sp-notifications.controller';
import './sp-notifications.scss';

let spNotificationsComponent = {
	restrict: 'E',
	bindings: {
		spName: '<',
		spType: '<',
		spNotifications: '<',
	},
	template,
	controller
};

export default spNotificationsComponent;
