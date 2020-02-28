'use strict';

import template from './entities-list.html';
import controller from './entities-list.controller';
import './entities-list.scss';

let entitiesListComponent = {
	restrict: 'E',
	bindings: {
		spEntities: '<',
		spSearchString: '<',
		onEntities: '&',
		onSelectedEntities: '&'
	},
	template,
	controller
};

export default entitiesListComponent;
