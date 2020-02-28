'use strict';

import spNotificationsComponent from './sp-notifications.component';

let spNotificationsModule = angular.module('spNotifications', [])

.component('spNotifications', spNotificationsComponent)

.name;

export default spNotificationsModule;
