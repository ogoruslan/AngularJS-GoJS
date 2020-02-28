'use strict';

class SPNotificationsController {
  constructor($mdDialog, spPopupFullscreen, spSnackbar, spUtils) {
    'ngInject';
    this.expanded = false;
  }

  toggle () {
    this.expanded = !this.expanded;
  }
}

export default SPNotificationsController;
