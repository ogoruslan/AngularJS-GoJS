'use strict';

import template from './sp-entity.html';
import controller from './sp-entity.controller';
import './sp-entity.scss';

let spEntityComponent = {
	restrict: 'E',
	bindings: {
		spEntity: '<',
		spSelectable: '<',
		spDeletable: '<',
		spLinkable: '<',
		spSelect: '<',
		onSelect: '&',
		onDelete: '&'
	},
	template,
	controller
};

export default spEntityComponent;
