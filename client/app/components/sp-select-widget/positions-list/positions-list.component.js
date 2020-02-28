'use strict';

import template from './positions-list.html';
import controller from './positions-list.controller';
import './positions-list.scss';

let positionsListComponent = {
	restrict: 'E',
	bindings: {
		spPositions: '<',
		spSelectedGroup: '<',
		spRootId: '<',
		spSearchString: '<',
		spSelectedItems: '<',
		onPositions: '&',
		onSelectedPositions: '&'
	},
	template,
	controller
};

export default positionsListComponent;
