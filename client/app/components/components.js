'use strict';

import SPAssignUser from './sp-assign-user/sp-assign-user';
import SPDate from './sp-date/sp-date';
import SPGoalplanning from './sp-goalplanning/sp-goalplanning';
import SPGoalplanningModel from './sp-goalplanning-model/sp-goalplanning-model';
import SPNotifications from './sp-notifications/sp-notifications';
import SPRightSidebar from './sp-right-sidebar/sp-right-sidebar';
import SPSnackbar from './sp-snackbar/sp-snackbar';
import SPUser from './sp-user/sp-user';
import SPUtils from './sp-utils/sp-utils';
import SPZoombar from './sp-zoombar/sp-zoombar';
import SPPopupFullscreen from './sp-popup-fullscreen/sp-popup-fullscreen';
import SPSelectWidget from './sp-select-widget/sp-select-widget';
import SPAddEntity from './sp-add-entity/sp-add-entity';
import SPEntity from './sp-entity/sp-entity';
import SPGojsToolbar from './sp-gojs-toolbar/sp-gojs-toolbar';
import SPAPIStack from './sp-api-stack/sp-api-stack';
import SPUsersModel from './sp-users-model/sp-users-model';
import SPConfig from './sp-config/sp-config';
import SPComment from './sp-comment/sp-comment';
import SPPropertiesComments from './sp-properties-comments/sp-properties-comments';

let componentsModule = angular.module('cmStrategicalPlanning.components', [
    SPAssignUser,
    SPDate,
    SPGoalplanning,
    SPGoalplanningModel,
    SPNotifications,
    SPRightSidebar,
    SPSnackbar,
    SPUser,
    SPUtils,
    SPZoombar,
    SPPopupFullscreen,
    SPSelectWidget,
    SPAddEntity,
    SPEntity,
    SPGojsToolbar,
    SPAPIStack,
    SPUsersModel,
    SPConfig,
    SPComment,
    SPPropertiesComments
])

.name;

export default componentsModule;
