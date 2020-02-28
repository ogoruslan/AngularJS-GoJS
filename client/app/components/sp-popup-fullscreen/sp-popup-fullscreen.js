'use strict';

import spPopupFullscreenFactory from './sp-popup-fullscreen.service';
import './sp-popup-fullscreen.scss';

let spPopupFullscreenModule = angular.module('spPopupFullscreen', [])

.factory('spPopupFullscreen', spPopupFullscreenFactory)

.name;

export default spPopupFullscreenModule;
