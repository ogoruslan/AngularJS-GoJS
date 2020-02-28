'use strict';

import template from './sp-user.html';
import controller from './sp-user.controller';
import './sp-user.scss';

let spUserComponent = {
	restrict: 'E',
	bindings: {
		spPosition: '<',
		spUser: '<',
		spAssignedMode: '<',
		spSelectable: '<',
		spDeletable: '<',
		spWithPermissions: '<',
		spHighlightText: '<',
		spSelect: '<',
		spDraggable: '<',
		onSelect: '&',
		onDelete: '&',
		onRestore: '&',
		onSelectAssignedPosition: '&',
		onDragstart: '&',
		onDragend: '&',
        onPermissionChanged: "&"
	},
	template,
	controller
};

export default spUserComponent;
