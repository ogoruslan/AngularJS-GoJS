'use strict';

let SPSnackbarFactory = function ($mdToast) {
  'ngInject';
  
  return {
    info: (text) => {
      setTimeout(() => {
        let toast = $mdToast.simple()
          .textContent(text || '')
          .highlightAction(true)
          .position('bottom left')
          .toastClass('sp-snackbar');
        
        $mdToast.show(toast);
      },100);
    },
    error: (text) => {
      setTimeout(() => {
        let toast = $mdToast.simple()
        .textContent(text || '')
        .highlightAction(true)
        .position('bottom left')
        .toastClass('sp-snackbar sp-snackbar-error');
    
        $mdToast.show(toast);
      },100);
    },
    undo: (text, callback) => {
      setTimeout(() => {
        let toast = $mdToast.simple()
        .textContent(text || '')
        .action('UNDO')
        .highlightAction(true)
        .highlightClass('sp-snackbar-button')
        .position('bottom left')
        .toastClass('sp-snackbar');
  
        //toast._options.hideDelay = 100000;
        $mdToast.show(toast).then((response) => {
          if ( response === 'ok' ) {
            callback && callback()
          }
        });
      },100);
    }
  }
};

export default SPSnackbarFactory;