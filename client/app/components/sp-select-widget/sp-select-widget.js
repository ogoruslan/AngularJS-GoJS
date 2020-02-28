'use strict';

import spSelectWidgetComponent from './sp-select-widget.component';
import PositionsList from './positions-list/positions-list';
import EntitesList from './entities-list/entities-list';
import InvitePosition from './invite-position/invite-position';

let spSelectWidgetModule = angular.module('spSelectWidget', [
  PositionsList,
  EntitesList,
  InvitePosition
])

.component('spSelectWidget', spSelectWidgetComponent)

.name;

export default spSelectWidgetModule;
