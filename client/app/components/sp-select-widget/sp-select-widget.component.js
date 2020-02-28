'use strict';

import template from './sp-select-widget.html';
import controller from './sp-select-widget.controller';
import './sp-select-widget.scss';

let spSelectWidgetComponent = {
	restrict: 'E',
	bindings: {
		spItemType: '@',
		spSearchItems: '<',
		spAddPosition: '<',
		spInviteUser: '<',
		onSelectedItems: '&',
        spSearchUsers: '<'
	},
	template,
	controller
};

export default spSelectWidgetComponent;
