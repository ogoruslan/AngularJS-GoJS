'use strict';

import template from './sp-add-entity.html';
import controller from './sp-add-entity.controller';
import './sp-add-entity.scss';

let spAddEntityComponent = {
	restrict: 'E',
	bindings: {
		spName: '<',
		spType: '<',
		spLabelCounter: '<',
        spLabelNoEntities: '<',
		spReadOnly: '<',
		spEntities: '<',
		spSearchEntities: '<',
		onEntityAdded: '&',
		onEntityRemoved: '&'
	},
	template,
	controller
};

export default spAddEntityComponent;
